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

export const StatusIdEventFilter = createTextFilter({
  id: `${MASTODON_INTEGRATION_ID}:${MastodonFilter.StatusId}`,
  name: "Status Id",
  description: "Filter by the id of the associated Mastodon status",
  eventMetaKey: `${MASTODON_STATUS_VARIABLE_PREFIX}${MastodonStatusVariable.Id}`,
  events: [
    getMastodonFilterEvent(MastodonEvent.Boost),
    getMastodonFilterEvent(MastodonEvent.Like),
    getMastodonFilterEvent(MastodonEvent.Reply),
  ],
});
