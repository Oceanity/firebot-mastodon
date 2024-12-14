import { Entity } from "megalodon";
import { MASTODON_AUTHOR_VARIABLE_PREFIX } from "../constants";

export const getUserProfileMetadata = (
  profile: Entity.Account,
  prefix: string
) => ({
  [`${prefix}Handle`]: profile.acct,
  [`${prefix}Username`]: profile.username,
  [`${prefix}DisplayName`]: profile.display_name,
  [`${prefix}AvatarUrl`]: profile.avatar,
  [`${prefix}Bio`]: profile.note,
  [`${prefix}BannerUrl`]: profile.header,
  [`${prefix}Id`]: profile.id,
  [`${prefix}CreatedAt`]: profile.created_at,
});

export const getPostMetadata = (post: Entity.Status, prefix: string) => ({
  [`${prefix}Text`]: post.plain_content,
  [`${prefix}Html`]: post.content,
  [`${prefix}Uri`]: post.uri,
  [`${prefix}Url`]: post.url,
  [`${prefix}Id`]: post.id,
  [`${prefix}CreatedAt`]: post.created_at,
  ...(post.account
    ? getUserProfileMetadata(post.account, MASTODON_AUTHOR_VARIABLE_PREFIX)
    : {}),
});
