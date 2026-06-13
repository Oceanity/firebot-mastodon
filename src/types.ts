import { Account } from "masto/mastodon/entities/v1/index.js";

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
