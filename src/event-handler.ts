import firebot from "@crowbartools/firebot-types";
import { Notification } from "masto/mastodon/entities/v1/notification.js";
import { Status } from "masto/mastodon/entities/v1/status.js";
import { Client as StreamingClient } from "masto/mastodon/streaming/client.js";
import {
  MASTODON_DELETE_VARIABLE,
  MASTODON_PLUGIN_ID,
  MASTODON_STATUS_VARIABLE_PREFIX,
  MASTODON_USER_VARIABLE_PREFIX,
} from "./constants";
import { mastodon } from "./main";
import { MastodonEvent } from "./types";
import {
  getPostMetadata,
  getUserProfileMetadata,
} from "./utils/mastodon-helpers";

export const hookMastodonFirebotEvents = async (
  streamingClient: StreamingClient,
) => {
  for await (const event of streamingClient.user.subscribe()) {
    switch (event.event) {
      case "notification":
        handleNotificationPayload(event.payload);
        break;

      case "update":
        handleUpdatePayload(event.payload);
        break;

      case "status.update":
        // TODO: Handle edit
        break;

      case "delete":
        handleDeletePayload(event.payload);
        break;

      default:
        firebot.logger.info(`Unhandled Event:\n${JSON.stringify(event)}`);
        break;
    }
  }

  //     this._stream.on("notification", async (event: Entity.Notification) => {
  //       const key = [event.type, event.status?.id].filter((e) => !!e).join(":");

  //       if (this.isInEventCache(key, event.account.id)) {
  //         firebot.logger.info(
  //           `Skipping duplicate ${event.type} notification event from account ${
  //             event.account.id
  //           }${!!event.status?.id ? ` on status ${event.status.id}` : ""}`,
  //         );
  //         return;
  //       }
  //     });
};

const handleNotificationPayload = async (notification: Notification) => {
  switch (notification.type) {
    case "favourite": {
      firebot.events.trigger(MASTODON_PLUGIN_ID, MastodonEvent.Like, {
        ...(await getUserProfileMetadata(
          notification.account,
          MASTODON_USER_VARIABLE_PREFIX,
        )),
        ...(await getPostMetadata(
          notification.status,
          MASTODON_STATUS_VARIABLE_PREFIX,
        )),
      });

      return;
    }

    case "follow": {
      firebot.events.trigger(MASTODON_PLUGIN_ID, MastodonEvent.Follow, {
        ...(await getUserProfileMetadata(
          notification.account,
          MASTODON_USER_VARIABLE_PREFIX,
        )),
      });

      return;
    }

    case "reblog": {
      firebot.events.trigger(MASTODON_PLUGIN_ID, MastodonEvent.Boost, {
        ...(await getUserProfileMetadata(
          notification.account,
          MASTODON_USER_VARIABLE_PREFIX,
        )),
        ...(await getPostMetadata(
          notification.status,
          MASTODON_STATUS_VARIABLE_PREFIX,
        )),
      });

      return;
    }

    case "mention": {
      firebot.events.trigger(
        MASTODON_PLUGIN_ID,
        notification.status?.inReplyToAccountId === mastodon.account?.id
          ? MastodonEvent.Reply
          : MastodonEvent.Mention,
        {
          ...(await getUserProfileMetadata(
            notification.account,
            MASTODON_USER_VARIABLE_PREFIX,
          )),
          ...(await getPostMetadata(
            notification.status,
            MASTODON_STATUS_VARIABLE_PREFIX,
          )),
        },
      );
    }
  }
};

const handleUpdatePayload = async (status: Status) => {
  firebot.events.trigger(MASTODON_PLUGIN_ID, MastodonEvent.NewStatus, {
    ...(await getUserProfileMetadata(
      status.account,
      MASTODON_USER_VARIABLE_PREFIX,
    )),
    ...(await getPostMetadata(status, MASTODON_STATUS_VARIABLE_PREFIX)),
  });
};

const handleDeletePayload = async (statusId: string) => {
  firebot.events.trigger(MASTODON_PLUGIN_ID, MastodonEvent.Delete, {
    [MASTODON_DELETE_VARIABLE]: statusId,
  });
};
