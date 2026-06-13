import firebot, { EventFilter } from "@crowbartools/firebot-types";
import { MASTODON_STATUS_VARIABLE_PREFIX } from "../constants";
import {
  MastodonEvent,
  MastodonFilter,
  MastodonStatusVariable,
} from "../types";
import { getMastodonEventSourceAndId } from "../utils/mastodon-helpers";

export const StatusIdEventFilter: EventFilter =
  firebot.eventFilterFactory.createTextFilter({
    id: MastodonFilter.StatusId,
    name: "Status Id",
    description: "Filter by the id of the associated Mastodon status",
    eventMetaKey: `${MASTODON_STATUS_VARIABLE_PREFIX}${MastodonStatusVariable.Id}`,
    events: [MastodonEvent.Boost, MastodonEvent.Like, MastodonEvent.Reply].map(
      (event: MastodonEvent) => getMastodonEventSourceAndId(event),
    ),
  });
