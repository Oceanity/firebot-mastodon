import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { InReplyToIdEventFilter } from "./in-reply-to-id";
import { StatusIdEventFilter } from "./status-id";
import { UserIdEventFilter } from "./user-account-id";
import { UserDisplayNameEventFilter } from "./user-display-name";
import { UserHandleEventFilter } from "./user-handle";

export const AllMastodonEventFilters: Array<Partial<EventFilter>> = [
  InReplyToIdEventFilter,
  StatusIdEventFilter,
  UserDisplayNameEventFilter,
  UserHandleEventFilter,
  UserIdEventFilter,
];
