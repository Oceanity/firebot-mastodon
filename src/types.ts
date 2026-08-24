import { Account } from "masto/mastodon/entities/v1/index.js";
import { Client as RestClient } from "masto/mastodon/rest/client.js";
import { Client as StreamingClient } from "masto/mastodon/streaming/client.js";

export interface MastodonState {
  restClient: RestClient | null;
  streamingClient: StreamingClient | null;
  account: Account | null;
  instanceUrl: URL | null;
}

export type MastodonAdditionalProperties = {
  inReplyTo?: Account;
};

export enum MastodonEvent {
  Follow = "follow",
  Like = "like",
  Boost = "boost",
  Mention = "mention",
  Reply = "reply",
  NewStatus = "new-status",
  Delete = "delete",
}

export enum MastodonFilter {
  UserAccountId = "account-id",
  InReplyToId = "in-reply-to-id",
  StatusId = "status-id",
  UserDisplayName = "user-display-name",
  UserHandle = "user-handle",
}

export enum MastodonUserVariable {
  Handle = "Handle",
  Username = "Username",
  DisplayName = "DisplayName",
  AvatarUrl = "AvatarUrl",
  BioHtml = "BioHtml",
  Bio = "Bio",
  BannerUrl = "BannerUrl",
  Id = "Id",
  CreatedAt = "CreatedAt",
}

export enum MastodonStatusVariable {
  Text = "Text",
  Html = "Html",
  Uri = "Uri",
  Url = "Url",
  Id = "Id",
  CreatedAt = "CreatedAt",
  InReplyToId = "InReplyToId",
  InReplyToUserId = "InReplyToUserId",
  InReplyToUserHandle = "InReplyToUserHandle",
  InReplyToUserDisplayName = "InReplyToUserDisplayName",
}
