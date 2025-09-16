import { createTextFilter } from "@oceanity/firebot-helpers/firebot";
import {
  MASTODON_INTEGRATION_ID,
  MASTODON_USER_VARIABLE_PREFIX,
} from "../constants";
import { MastodonEvent, MastodonFilter, MastodonUserVariable } from "../types";
import { getMastodonFilterEvent } from "../utils/mastodon-helpers";

export const UserIdEventFilter = createTextFilter({
  id: `${MASTODON_INTEGRATION_ID}:${MastodonFilter.UserAccountId}`,
  name: "Account Id",
  description: "Filter by the id of the associated Mastodon account",
  eventMetaKey: `${MASTODON_USER_VARIABLE_PREFIX}${MastodonUserVariable.Id}`,
  events: [
    getMastodonFilterEvent(MastodonEvent.Boost),
    getMastodonFilterEvent(MastodonEvent.Follow),
    getMastodonFilterEvent(MastodonEvent.Like),
    getMastodonFilterEvent(MastodonEvent.Mention),
    getMastodonFilterEvent(MastodonEvent.Reply),
    getMastodonFilterEvent(MastodonEvent.NewStatus),
  ],
});
