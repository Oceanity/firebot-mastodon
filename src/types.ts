import { Account } from "megalodon/lib/esm/entities/account";

export type MastodonIntegrationSettings = {
  account: {
    instanceType?:
      | "mastodon"
      | "pleroma"
      | "friendica"
      | "firefish"
      | "gotosocial";
    baseUrl: string;
    accessToken: string;
  };
};

export type MastodonAdditionalProperties = {
  in_reply_to?: Account;
};

export enum MastodonEvent {
  Follow = "follow",
  Like = "like",
  Boost = "boost",
  Mention = "mention",
  Reply = "reply",
  NewStatus = "new-status",
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
