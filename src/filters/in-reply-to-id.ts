import { createTextFilter } from "@oceanity/firebot-helpers/firebot";
import {
  MASTODON_INTEGRATION_ID,
  MASTODON_STATUS_VARIABLE_PREFIX,
} from "../constants";
import {
  MastodonEvent,
  MastodonFilter,
  MastodonStatusVariable,
} from "../types";
import { getMastodonFilterEvent } from "../utils/mastodon-helpers";

export const InReplyToIdEventFilter = createTextFilter({
  id: `${MASTODON_INTEGRATION_ID}:${MastodonFilter.InReplyToId}`,
  name: "In Reply To Id",
  description:
    "Filter by the id of the associated Mastodon status being replied to",
  eventMetaKey: `${MASTODON_STATUS_VARIABLE_PREFIX}${MastodonStatusVariable.InReplyToId}`,
  events: [
    getMastodonFilterEvent(MastodonEvent.Boost),
    getMastodonFilterEvent(MastodonEvent.Follow),
    getMastodonFilterEvent(MastodonEvent.Like),
    getMastodonFilterEvent(MastodonEvent.Reply),
    getMastodonFilterEvent(MastodonEvent.NewStatus),
  ],
});
