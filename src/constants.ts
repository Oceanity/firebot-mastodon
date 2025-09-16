import { IntegrationDefinition } from "@crowbartools/firebot-custom-scripts-types";
import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import * as packageJson from "../package.json";
import { MastodonEvent, MastodonIntegrationSettings } from "./types";

export const {
  displayName: MASTODON_INTEGRATION_NAME,
  description: MASTODON_INTEGRATION_DESCRIPTION,
  author: MASTODON_INTEGRATION_AUTHOR,
  version: MASTODON_INTEGRATION_VERSION,
} = packageJson;

export const MASTODON_INTEGRATION_NAME_AND_AUTHOR = `${MASTODON_INTEGRATION_NAME} (by ${MASTODON_INTEGRATION_AUTHOR})`;
export const MASTODON_INTEGRATION_ID = "oceanity:mastodon";
export const MASTODON_INTEGRATION_FIREBOT_VERSION = "5";
export const MASTODON_POST_VARIABLE_PREFIX = "mastodonPost";
export const MASTODON_STATUS_VARIABLE_PREFIX = "mastodonStatus";
export const MASTODON_USER_VARIABLE_PREFIX = "mastodonUser";
export const MASTODON_POST_AUTHOR_VARIABLE_PREFIX = `${MASTODON_POST_VARIABLE_PREFIX}Author`;
export const MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX = `${MASTODON_STATUS_VARIABLE_PREFIX}Author`;

export const MASTODON_INTEGRATION_DEFINITION: IntegrationDefinition<MastodonIntegrationSettings> =
  {
    id: MASTODON_INTEGRATION_ID,
    name: MASTODON_INTEGRATION_NAME,
    description: MASTODON_INTEGRATION_DESCRIPTION,
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
    {
      id: MastodonEvent.NewStatus,
      name: "New Status",
      description: "When a new status is posted to the timeline",
    },
  ],
};
