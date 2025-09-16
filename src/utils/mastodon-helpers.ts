import { convert } from "html-to-text";
import { Entity } from "megalodon";
import {
  MASTODON_INTEGRATION_ID,
  MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
} from "../constants";
import { mastodonIntegration } from "../mastodon-integration";
import {
  MastodonAdditionalProperties,
  MastodonEvent,
  MastodonStatusVariable,
  MastodonUserVariable,
} from "../types";

export async function getUserProfileMetadata(
  profile: Entity.Account,
  prefix: string
) {
  return {
    [`${prefix}${MastodonUserVariable.Handle}`]: getFullMastodonHandle(
      profile.acct
    ),
    [`${prefix}${MastodonUserVariable.Username}`]: profile.username,
    [`${prefix}${MastodonUserVariable.DisplayName}`]: profile.display_name,
    [`${prefix}${MastodonUserVariable.AvatarUrl}`]: profile.avatar,
    [`${prefix}${MastodonUserVariable.BioHtml}`]: replaceEmojisInHtml(
      profile.note,
      profile.emojis
    ),
    [`${prefix}${MastodonUserVariable.Bio}`]: convert(profile.note, {
      selectors: [{ selector: "a", options: { ignoreHref: true } }],
    }),
    [`${prefix}${MastodonUserVariable.BannerUrl}`]: profile.header,
    [`${prefix}${MastodonUserVariable.Id}`]: profile.id,
    [`${prefix}${MastodonUserVariable.CreatedAt}`]: profile.created_at,
  };
}

export async function getPostMetadata(post: Entity.Status, prefix: string) {
  const additionalProps: MastodonAdditionalProperties = {};

  if (post.in_reply_to_account_id) {
    const response = await mastodonIntegration.client.getAccount(
      post.in_reply_to_account_id
    );

    if (response.status === 200 && response.data) {
      additionalProps.in_reply_to = response.data;
    }
  }

  return {
    [`${prefix}${MastodonStatusVariable.Text}`]: convert(post.content, {
      selectors: [{ selector: "a", options: { ignoreHref: true } }],
    }),
    [`${prefix}${MastodonStatusVariable.Html}`]: replaceEmojisInHtml(
      post.content,
      post.emojis
    ),
    [`${prefix}${MastodonStatusVariable.Uri}`]: post.uri,
    [`${prefix}${MastodonStatusVariable.Url}`]: post.url,
    [`${prefix}${MastodonStatusVariable.Id}`]: post.id,
    [`${prefix}${MastodonStatusVariable.CreatedAt}`]: post.created_at,
    [`${prefix}${MastodonStatusVariable.InReplyToId}`]: post.in_reply_to_id,
    [`${prefix}${MastodonStatusVariable.InReplyToUserId}`]:
      post.in_reply_to_account_id,
    [`${prefix}${MastodonStatusVariable.InReplyToUserHandle}`]:
      getFullMastodonHandle(additionalProps.in_reply_to?.acct),
    ...(post.account
      ? getUserProfileMetadata(
          post.account,
          MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX
        )
      : {}),
  };
}

export function replaceEmojisInHtml(html: string, emojis: Array<Entity.Emoji>) {
  for (const emoji of emojis) {
    html = html.replace(
      new RegExp(`:${emoji.shortcode}:`, "g"),
      `<img class="emoji" alt="${emoji.shortcode}" src="${emoji.url}" />`
    );
  }
  return html;
}

export const getMastodonFilterEvent = (eventId: MastodonEvent) => ({
  eventSourceId: MASTODON_INTEGRATION_ID,
  eventId,
});

export function getMastodonHandleFromAccountUrl(url?: string) {
  const regex = /^https?:\/\/([^\/]+)\/@([^\/?#]+)/;
  const match = url?.match(regex);

  return match ? `${match[2]}@${match[1]}` : null;
}

const getFullMastodonHandle = (handle?: string) =>
  !handle || handle.includes("@")
    ? handle
    : `${handle}@${mastodonIntegration.instance}`;
