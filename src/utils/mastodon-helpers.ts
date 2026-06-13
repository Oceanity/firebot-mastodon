import { EventSourceAndId } from "@crowbartools/firebot-types";
import { convert } from "html-to-text";
import {
  Account,
  CustomEmoji,
  Status,
} from "masto/mastodon/entities/v1/index.js";
import {
  MASTODON_PLUGIN_ID,
  MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
} from "../constants";
import { mastodon } from "../main";
import {
  MastodonAdditionalProperties,
  MastodonEvent,
  MastodonStatusVariable,
  MastodonUserVariable,
} from "../types";

export async function getUserProfileMetadata(profile: Account, prefix: string) {
  return {
    [`${prefix}${MastodonUserVariable.Handle}`]: profile.acct,
    [`${prefix}${MastodonUserVariable.Username}`]: profile.username,
    [`${prefix}${MastodonUserVariable.DisplayName}`]: profile.displayName,
    [`${prefix}${MastodonUserVariable.AvatarUrl}`]: profile.avatar,
    [`${prefix}${MastodonUserVariable.BioHtml}`]: replaceEmojisInHtml(
      profile.note,
      profile.emojis,
    ),
    [`${prefix}${MastodonUserVariable.Bio}`]: convert(profile.note, {
      selectors: [{ selector: "a", options: { ignoreHref: true } }],
    }),
    [`${prefix}${MastodonUserVariable.BannerUrl}`]: profile.header,
    [`${prefix}${MastodonUserVariable.Id}`]: profile.id,
    [`${prefix}${MastodonUserVariable.CreatedAt}`]: profile.createdAt,
  };
}

export async function getPostMetadata(post: Status, prefix: string) {
  const additionalProps: MastodonAdditionalProperties = {};

  if (post.inReplyToAccountId) {
    const account = await mastodon.restClient?.v1.accounts
      .$select(post.inReplyToAccountId)
      .fetch();

    if (account) {
      additionalProps.inReplyTo = account;
    }
  }

  return {
    [`${prefix}${MastodonStatusVariable.Text}`]: convert(post.content, {
      selectors: [{ selector: "a", options: { ignoreHref: true } }],
    }),
    [`${prefix}${MastodonStatusVariable.Html}`]: replaceEmojisInHtml(
      post.content,
      post.emojis,
    ),
    [`${prefix}${MastodonStatusVariable.Uri}`]: post.uri,
    [`${prefix}${MastodonStatusVariable.Url}`]: post.url,
    [`${prefix}${MastodonStatusVariable.Id}`]: post.id,
    [`${prefix}${MastodonStatusVariable.CreatedAt}`]: post.createdAt,
    [`${prefix}${MastodonStatusVariable.InReplyToId}`]: post.inReplyToId,
    [`${prefix}${MastodonStatusVariable.InReplyToUserId}`]:
      post.inReplyToAccountId,
    [`${prefix}${MastodonStatusVariable.InReplyToUserHandle}`]:
      getFullMastodonHandle(additionalProps.inReplyTo?.acct),
    ...(post.account
      ? await getUserProfileMetadata(
          post.account,
          MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
        )
      : {}),
  };
}

export function replaceEmojisInHtml(html: string, emojis: Array<CustomEmoji>) {
  for (const emoji of emojis) {
    html = html.replace(
      new RegExp(`:${emoji.shortcode}:`, "g"),
      `<img class="emoji" alt="${emoji.shortcode}" src="${emoji.url}" />`,
    );
  }
  return html;
}

export const getMastodonEventSourceAndId = (
  eventId: MastodonEvent,
): EventSourceAndId => ({
  eventSourceId: MASTODON_PLUGIN_ID,
  eventId,
});

export function getMastodonHandleFromAccountUrl(
  url?: string,
): string | undefined {
  const regex = /^https?:\/\/([^\/]+)\/@([^\/?#]+)/;
  const match = url?.match(regex);

  return match ? `${match[2]}@${match[1]}` : undefined;
}

const getFullMastodonHandle = (handle?: string) =>
  !handle || handle.includes("@") || !mastodon.instanceUrl
    ? handle
    : `${handle}@${mastodon.instanceUrl.hostname}`;
