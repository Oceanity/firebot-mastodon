import { EventFilter } from "@crowbartools/firebot-types";
import { MASTODON_PLUGIN_ID } from "../constants";
import { InReplyToIdEventFilter } from "./in-reply-to-id";
import { StatusIdEventFilter } from "./status-id";
import { UserIdEventFilter } from "./user-account-id";
import { UserDisplayNameEventFilter } from "./user-display-name";
import { UserHandleEventFilter } from "./user-handle";

export const AllMastodonEventFilters: Array<EventFilter> = [
  InReplyToIdEventFilter,
  StatusIdEventFilter,
  UserDisplayNameEventFilter,
  UserHandleEventFilter,
  UserIdEventFilter,
].map((filter) => {
  filter.id = `${MASTODON_PLUGIN_ID}:${filter.id}`;
  return filter;
});
