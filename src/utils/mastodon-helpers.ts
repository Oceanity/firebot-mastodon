import { logger } from "@oceanity/firebot-helpers/firebot";
import { convert } from "html-to-text";
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
  [`${prefix}BioHtml`]: replaceEmojisInHtml(profile.note, profile.emojis),
  [`${prefix}Bio`]: convert(profile.note, {
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  }),
  [`${prefix}BannerUrl`]: profile.header,
  [`${prefix}Id`]: profile.id,
  [`${prefix}CreatedAt`]: profile.created_at,
});

export const getPostMetadata = (post: Entity.Status, prefix: string) => ({
  [`${prefix}Text`]: convert(post.content, {
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  }),
  [`${prefix}Html`]: replaceEmojisInHtml(post.content, post.emojis),
  [`${prefix}Uri`]: post.uri,
  [`${prefix}Url`]: post.url,
  [`${prefix}Id`]: post.id,
  [`${prefix}CreatedAt`]: post.created_at,
  ...(post.account
    ? getUserProfileMetadata(post.account, MASTODON_AUTHOR_VARIABLE_PREFIX)
    : {}),
});

export function replaceEmojisInHtml(html: string, emojis: Array<Entity.Emoji>) {
  logger.info(html + `\n${JSON.stringify(emojis)}`);
  for (const emoji of emojis) {
    html = html.replace(
      new RegExp(`:${emoji.shortcode}:`, "g"),
      `<img class="emoji" alt="${emoji.shortcode}" src="${emoji.url}" />`
    );
  }
  return html;
}
