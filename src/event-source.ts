import { EventSource } from "@crowbartools/firebot-types";
import { MASTODON_PLUGIN_ID } from "./constants";
import { MastodonEvent } from "./types";

export const MastodonPluginEventSource: EventSource = {
  id: MASTODON_PLUGIN_ID,
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
      name: "New Status Posted",
      description: "When a new status is posted to the local timeline",
    },
    {
      id: MastodonEvent.Delete,
      name: "Status Deleted",
      description: "When a status is deleted from the local timeline",
    },
  ],
};
