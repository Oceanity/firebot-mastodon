import firebot, { EventFilter } from "@crowbartools/firebot-types";
import { MASTODON_STATUS_VARIABLE_PREFIX } from "../constants";
import {
  MastodonEvent,
  MastodonFilter,
  MastodonStatusVariable,
} from "../types";
import { getMastodonEventSourceAndId } from "../utils/mastodon-helpers";

export const InReplyToIdEventFilter: EventFilter =
  //@ts-expect-error(2339)
  firebot.factories.eventFilters.createTextFilter({
    id: MastodonFilter.InReplyToId,
    name: "In Reply To Id",
    description:
      "Filter by the id of the associated Mastodon status being replied to",
    eventMetaKey: `${MASTODON_STATUS_VARIABLE_PREFIX}${MastodonStatusVariable.InReplyToId}`,
    events: [
      MastodonEvent.Boost,
      MastodonEvent.Follow,
      MastodonEvent.Like,
      MastodonEvent.Reply,
      MastodonEvent.NewStatus,
    ].map((event: MastodonEvent) => getMastodonEventSourceAndId(event)),
  });
