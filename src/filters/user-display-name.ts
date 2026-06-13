import firebot, { EventFilter } from "@crowbartools/firebot-types";
import { MASTODON_USER_VARIABLE_PREFIX } from "../constants";
import { MastodonEvent, MastodonFilter, MastodonUserVariable } from "../types";
import { getMastodonEventSourceAndId } from "../utils/mastodon-helpers";

export const UserDisplayNameEventFilter: EventFilter =
  firebot.eventFilterFactory.createTextFilter({
    id: MastodonFilter.UserDisplayName,
    name: "User Display Name",
    description:
      "Filter by the display name of the associated Mastodon account",
    eventMetaKey: `${MASTODON_USER_VARIABLE_PREFIX}${MastodonUserVariable.DisplayName}`,
    events: [
      MastodonEvent.Boost,
      MastodonEvent.Follow,
      MastodonEvent.Like,
      MastodonEvent.Mention,
      MastodonEvent.Reply,
      MastodonEvent.NewStatus,
    ].map((event: MastodonEvent) => getMastodonEventSourceAndId(event)),
  });
