import { IntegrationDefinition } from "@crowbartools/firebot-custom-scripts-types";
import * as packageJson from "../package.json";
import { MastodonEvent, MastodonIntegrationSettings } from "./types";
import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import { Entity, NotificationType } from "megalodon";
import { eventManager, logger } from "@oceanity/firebot-helpers/firebot";
import { getPostMetadata, getUserProfileMetadata } from "./utils/mastodon";
import { mastodonIntegration } from "./mastodon-integration";

export const {
  displayName: MASTODON_INTEGRATION_NAME,
  description: MASTODON_INTEGRATION_DESCRIPTION,
  author: MASTODON_INTEGRATION_AUTHOR,
  version: MASTODON_INTEGRATION_VERSION,
} = packageJson;

export const MASTODON_INTEGRATION_ID = "oceanity:mastodon";
export const MASTODON_INTEGRATION_FIREBOT_VERSION = "5";
export const MASTODON_POST_VARIABLE_PREFIX = "mastodonPost";
export const MASTODON_USER_VARIABLE_PREFIX = "mastodonUser";
export const MASTODON_AUTHOR_VARIABLE_PREFIX = `${MASTODON_POST_VARIABLE_PREFIX}Author`;

export const MASTODON_INTEGRATION_DEFINITION: IntegrationDefinition<MastodonIntegrationSettings> =
  {
    id: MASTODON_INTEGRATION_ID,
    name: "Mastodon (by Oceanity)",
    description:
      "Enables posting to Mastodon and adds events for follows, likes, replies and boosts",
    linkType: "none",
    configurable: true,
    connectionToggle: false,
    settingCategories: {
      account: {
        title: "Account",
        settings: {
          baseUrl: {
            type: "string",
            default: "",
            title: "Base Url",
            description:
              "The base url of your Mastodon instance, eg. mastodon.social",
            validation: {
              required: true,
            },
          },
          accessToken: {
            type: "string",
            default: "",
            title: "Access Token",
            description:
              "The access token for your Mastodon account, get one from the Developers section of Settings",
            validation: {
              required: true,
            },
          },
        },
      },
    },
  };

export const MASTODON_EVENT_SOURCE: EventSource = {
  id: MASTODON_INTEGRATION_ID,
  name: "Mastodon",
  events: [
    {
      id: MastodonEvent.Follow,
      name: "Follow",
      description: "When someone follows you on Mastodon",
    },
    {
      id: MastodonEvent.Like,
      name: "Like",
      description: "When someone likes one of your posts on Mastodon",
    },
    {
      id: MastodonEvent.Reply,
      name: "Reply",
      description: "When someone replies to one of your posts on Mastodon",
    },
    {
      id: MastodonEvent.Boost,
      name: "Boost",
      description: "When someone boosts one of your posts on Mastodon",
    },
    {
      id: MastodonEvent.Mention,
      name: "Mention",
      description: "When someone mentions you on Mastodon",
    },
  ],
};

export const MASTODON_NOTIFICATION_HANDLERS = {
  [NotificationType.Follow]: (event: Entity.Notification) => {
    eventManager.triggerEvent(MASTODON_INTEGRATION_ID, MastodonEvent.Follow, {
      ...getUserProfileMetadata(event.account, MASTODON_USER_VARIABLE_PREFIX),
    });
  },
  [NotificationType.Favourite]: (event: Entity.Notification) => {
    eventManager.triggerEvent(MASTODON_INTEGRATION_ID, MastodonEvent.Like, {
      ...getUserProfileMetadata(event.account, MASTODON_USER_VARIABLE_PREFIX),
      ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
    });
  },
  [NotificationType.Reblog]: (event: Entity.Notification) => {
    eventManager.triggerEvent(MASTODON_INTEGRATION_ID, MastodonEvent.Boost, {
      ...getUserProfileMetadata(event.account, MASTODON_USER_VARIABLE_PREFIX),
      ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
    });
  },
  [NotificationType.Mention]: async (event: Entity.Notification) => {
    // If it was in reply to one of your statuses
    if (event.status?.in_reply_to_account_id === mastodonIntegration?.me?.id) {
      eventManager.triggerEvent(MASTODON_INTEGRATION_ID, MastodonEvent.Reply, {
        ...getUserProfileMetadata(event.account, MASTODON_USER_VARIABLE_PREFIX),
        ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
      });
      return;
    }
    // If it was just a random mention
    eventManager.triggerEvent(MASTODON_INTEGRATION_ID, MastodonEvent.Mention, {
      ...getUserProfileMetadata(event.account, MASTODON_USER_VARIABLE_PREFIX),
      ...getPostMetadata(event.status, MASTODON_POST_VARIABLE_PREFIX),
    });
  },
};
