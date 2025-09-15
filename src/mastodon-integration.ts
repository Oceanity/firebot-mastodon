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
  MASTODON_STATUS_VARIABLE_PREFIX,
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
  private readonly _eventCache: Record<string, string[]>;

  constructor() {
    super();

    this._eventCache = {};
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

    this._stream.on("update", async (status: Entity.Status) => {
      eventManager.triggerEvent(
        MASTODON_INTEGRATION_ID,
        MastodonEvent.NewStatus,
        {
          ...(await getUserProfileMetadata(
            status.account,
            MASTODON_USER_VARIABLE_PREFIX
          )),
          ...(await getPostMetadata(status, MASTODON_STATUS_VARIABLE_PREFIX)),
        }
      );
    });

    this._stream.on("notification", async (event: Entity.Notification) => {
      const key = [event.type, event.status?.id].filter((e) => !!e).join(":");

      if (this.isInEventCache(key, event.account.id)) {
        logger.info(
          `Skipping duplicate ${event.type} notification event from account ${
            event.account.id
          }${!!event.status?.id ? ` on status ${event.status.id}` : ""}`
        );
        return;
      }

      switch (event.type) {
        case NotificationType.Follow:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            MastodonEvent.Follow,
            {
              ...(await getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              )),
            }
          );
          break;

        case NotificationType.Favourite:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            MastodonEvent.Like,
            {
              ...(await getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              )),
              ...(await getPostMetadata(
                event.status,
                MASTODON_STATUS_VARIABLE_PREFIX
              )),
            }
          );
          break;

        case NotificationType.Reblog:
          eventManager.triggerEvent(
            MASTODON_INTEGRATION_ID,
            MastodonEvent.Boost,
            {
              ...(await getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              )),
              ...(await getPostMetadata(
                event.status,
                MASTODON_STATUS_VARIABLE_PREFIX
              )),
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
              ...(await getUserProfileMetadata(
                event.account,
                MASTODON_USER_VARIABLE_PREFIX
              )),
              ...(await getPostMetadata(
                event.status,
                MASTODON_STATUS_VARIABLE_PREFIX
              )),
            }
          );
          break;

        default:
          logger.warn("Unsupported notification type", event.type);
          break;
      }
    });

    this._stream.on("delete", (id: number) => {
      logger.info(`Post deleted: ${id.toString()}`);
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
  private isInEventCache = (key: string, value: string): boolean => {
    if (!this._eventCache[key]) {
      this._eventCache[key] = [];
    }

    const isInCache = this._eventCache[key].some((v) => v === value);

    this._eventCache[key].push(value);

    return isInCache;
  };
}

export let mastodonIntegration: MastodonIntegration | undefined;

export function initMastodonIntegration() {
  mastodonIntegration = new MastodonIntegration();

  return mastodonIntegration;
}
