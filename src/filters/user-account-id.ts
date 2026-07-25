import firebot, { EventFilter } from "@crowbartools/firebot-types";
import { MASTODON_USER_VARIABLE_PREFIX } from "../constants";
import { MastodonEvent, MastodonFilter, MastodonUserVariable } from "../types";
import { getMastodonEventSourceAndId } from "../utils/mastodon-helpers";

export const UserIdEventFilter: EventFilter =
  //@ts-expect-error(2339)
  firebot.factories.eventFilters.createTextFilter({
    id: MastodonFilter.UserAccountId,
    name: "Account Id",
    description: "Filter by the id of the associated Mastodon account",
    eventMetaKey: `${MASTODON_USER_VARIABLE_PREFIX}${MastodonUserVariable.Id}`,
    events: [
      MastodonEvent.Boost,
      MastodonEvent.Follow,
      MastodonEvent.Like,
      MastodonEvent.Mention,
      MastodonEvent.Reply,
      MastodonEvent.NewStatus,
    ].map((event: MastodonEvent) => getMastodonEventSourceAndId(event)),
  });
