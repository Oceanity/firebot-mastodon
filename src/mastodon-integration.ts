import {
  IntegrationController,
  IntegrationData,
  IntegrationEvents,
} from "@crowbartools/firebot-custom-scripts-types";
import { eventManager, logger } from "@oceanity/firebot-helpers/firebot";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import generator, {
  Entity,
  MegalodonInterface,
  NotificationType,
  WebSocketInterface,
} from "megalodon";
import { TypedEmitter } from "tiny-typed-emitter";
import {
  MASTODON_INTEGRATION_ID,
  MASTODON_POST_VARIABLE_PREFIX,
  MASTODON_USER_VARIABLE_PREFIX,
} from "./constants";
import { MastodonEvent, MastodonIntegrationSettings } from "./types";
import {
  getPostMetadata,
  getUserProfileMetadata,
} from "./utils/mastodon-helpers";

class IntegrationEventEmitter extends TypedEmitter<IntegrationEvents> {}

class MastodonIntegration
  extends IntegrationEventEmitter
  implements IntegrationController<MastodonIntegrationSettings>
{
  connected = false;

  public client: MegalodonInterface | undefined;
  public me: Entity.Account | undefined;
  private _stream: WebSocketInterface | undefined;
  private readonly _eventsCache: Record<string, Array<string>>;

  constructor() {
    super();

    this._eventsCache = {};
  }

  init(
    _linked: boolean,
    integrationData: IntegrationData<MastodonIntegrationSettings>
  ): void | PromiseLike<void> {
    logger.info(
      "Mastodon Integration Initialized",
      integrationData.userSettings?.account?.baseUrl
    );

    this.initMastodonBot(integrationData.userSettings);
  }

  onUserSettingsUpdate(
    integrationData: IntegrationData<MastodonIntegrationSettings>
  ): void | PromiseLike<void> {
    logger.info("Mastodon Integration settings updated");

    this.initMastodonBot(integrationData.userSettings);
  }

  triggerEvent = (event: MastodonEvent, data: any) =>
    eventManager.triggerEvent(MASTODON_INTEGRATION_ID, event, data);

  private async initMastodonBot(settings?: MastodonIntegrationSettings) {
    if (this.client) {
      try {
        delete this.client;
      } catch (error) {
        logger.error(getErrorMessage(error));
      }
    }
    if (this._stream) {
      try {
        this._stream.removeAllListeners();
        this._stream.stop();
        delete this._stream;
      } catch (error) {
        logger.error(getErrorMessage(error));
      }
    }

    const instanceType = settings?.account?.instanceType;
    const baseUrl = settings?.account?.baseUrl;
    const accessToken = settings?.account?.accessToken;

    if (!baseUrl || !accessToken) {
      logger.warn("Mastodon Integration account credentials are missing");
      return;
    }

    logger.info("initMastodonBot");

    // Initial connection
    try {
      this.client = generator(
        instanceType ?? "mastodon",
        `https://${baseUrl}`,
        accessToken
      );
      this._stream = await this.client.userStreaming();
      this.me = (await this.client.verifyAccountCredentials()).data;
    } catch (error) {
      logger.error(getErrorMessage(error));
      this.connected = false;
      delete this.client;
      delete this._stream;
      delete this.me;
      return;
    }

    this._stream.on("connect", () => {
      this.connected = true;
      logger.info("Mastodon Integration connected!");
    });

    this._stream.on("update", (status: Entity.Status) => {
      logger.info(
        "Unsupported status update type",
        status.account.acct,
        status.plain_content
      );
    });

    this._stream.on("notification", (event: Entity.Notification) => {
      const key = [event.type, event.status?.id].filter((e) => !!e).join(":");

      if (this.isInEventCache(key, event.account.id)) {
        logger.info(
          "Skipping duplicate notification event",
          event.type,
          event.status?.id,
          event.account.id
        );
        return;
      }

      switch (event.type) {
        case NotificationType.Follow:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            MastodonEvent.Follow,
            {
              ...getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              ),
            }
          );
          break;

        case NotificationType.Favourite:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            MastodonEvent.Like,
            {
              ...getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              ),
              ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
            }
          );
          break;

        case NotificationType.Reblog:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            MastodonEvent.Boost,
            {
              ...getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              ),
              ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
            }
          );
          break;

        case NotificationType.Mention:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            event.status?.in_reply_to_account_id === mastodonIntegration?.me?.id
              ? MastodonEvent.Reply
              : MastodonEvent.Mention,
            {
              ...getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              ),
              ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
            }
          );
          break;

        default:
          logger.warn("Unsupported notification type", event.type);
          break;
      }
    });

    this._stream.on("delete", (id: number) => {
      logger.info(id.toString());
    });

    this._stream.on("error", (err: Error) => {
      logger.error(err.message);
    });

    this._stream.on("heartbeat", () => {
      logger.info("Mastodon heartbeat received");
    });

    this._stream.on("close", () => {
      this.connected = false;
      logger.info("Connection to Mastodon closed");
    });

    this._stream.on("parser-error", (err: Error) => {
      logger.error(err.message);
    });
  }

  private isInEventCache = (key: string, user: string): boolean => {
    if (!this._eventsCache[key]) {
      this._eventsCache[key] = [];
    }

    const isCached = this._eventsCache[key].some((u) => u === user);

    this._eventsCache[key].push(user);

    return isCached;
  };
}

export let mastodonIntegration: MastodonIntegration | undefined;

export function initMastodonIntegration() {
  mastodonIntegration = new MastodonIntegration();

  return mastodonIntegration;
}
