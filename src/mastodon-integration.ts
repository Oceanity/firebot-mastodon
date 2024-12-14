import { eventManager, logger } from "@oceanity/firebot-helpers/firebot";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import {
  IntegrationController,
  IntegrationData,
  IntegrationEvents,
} from "@crowbartools/firebot-custom-scripts-types";
import { TypedEmitter } from "tiny-typed-emitter";
import generator, {
  Entity,
  MegalodonInterface,
  WebSocketInterface,
} from "megalodon";
import {
  MASTODON_INTEGRATION_ID,
  MASTODON_NOTIFICATION_HANDLERS,
} from "./constants";
import { MastodonEvent, MastodonIntegrationSettings } from "./types";

class IntegrationEventEmitter extends TypedEmitter<IntegrationEvents> {}

class MastodonIntegration
  extends IntegrationEventEmitter
  implements IntegrationController<MastodonIntegrationSettings>
{
  connected = false;

  public client: MegalodonInterface | undefined;
  public me: Entity.Account | undefined;
  private _stream: WebSocketInterface | undefined;

  constructor() {
    super();
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
      logger.info(
        "Mastodon notification event",
        event.type,
        event.account.acct,
        event.status?.id ?? "no status"
      );
      if (MASTODON_NOTIFICATION_HANDLERS[event.type]) {
        MASTODON_NOTIFICATION_HANDLERS[event.type](event);
        return;
      }

      logger.info("Unsupported notification type", event.type);
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
}

export let mastodonIntegration: MastodonIntegration | undefined;

export function initMastodonIntegration() {
  mastodonIntegration = new MastodonIntegration();

  return mastodonIntegration;
}
