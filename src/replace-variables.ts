import firebot, {
  ReplaceVariable,
  VariableConfig,
} from "@crowbartools/firebot-types";
import {
  MASTODON_DELETE_VARIABLE,
  MASTODON_PLUGIN_ID,
  MASTODON_POST_AUTHOR_VARIABLE_PREFIX,
  MASTODON_POST_VARIABLE_PREFIX,
  MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
  MASTODON_STATUS_VARIABLE_PREFIX,
  MASTODON_USER_VARIABLE_PREFIX,
} from "./constants";
import {
  MastodonEvent,
  MastodonStatusVariable,
  MastodonUserVariable,
} from "./types";

// One-offs
const mastodonDeletedStatusId: ReplaceVariable =
  //@ts-expect-error(2339)
  firebot.factories.variables.createEventDataVariable({
    handle: MASTODON_DELETE_VARIABLE,
    description: "The id of the status that was deleted",
    events: [MastodonEvent.Delete],
    eventMetaKey: MASTODON_DELETE_VARIABLE,
    type: "text",
  });

export const AllMastodonReplaceVariables = [
  mastodonDeletedStatusId,
  ...buildMastodonProfileVariables(MASTODON_USER_VARIABLE_PREFIX, [
    MastodonEvent.Follow,
    MastodonEvent.Like,
    MastodonEvent.Boost,
    MastodonEvent.Mention,
    MastodonEvent.Reply,
    MastodonEvent.NewStatus,
  ]),

  ...buildMastodonPostVariables(
    [MASTODON_STATUS_VARIABLE_PREFIX, MASTODON_POST_VARIABLE_PREFIX],
    [
      MastodonEvent.Like,
      MastodonEvent.Boost,
      MastodonEvent.Mention,
      MastodonEvent.Reply,
      MastodonEvent.NewStatus,
    ],
  ),
];

function buildMastodonProfileVariables(
  prefix: string | string[],
  events: MastodonEvent[],
): Array<ReplaceVariable> {
  if (!Array.isArray(prefix)) {
    prefix = [prefix];
  }

  const profileProperties: Array<[property: string, description: string]> = [
    [MastodonUserVariable.Handle, "The users's handle"],
    [MastodonUserVariable.Username, "The user's username"],
    [MastodonUserVariable.DisplayName, "The user's display name"],
    [MastodonUserVariable.AvatarUrl, "The user's avatar URL"],
    [MastodonUserVariable.BioHtml, "The user's bio with HTML formatting"],
    [MastodonUserVariable.Bio, "The user's bio"],
    [MastodonUserVariable.BannerUrl, "The user's banner URL"],
    [MastodonUserVariable.Id, "The user's ID"],
    [MastodonUserVariable.CreatedAt, "The user's creation date"],
  ];

  return profileProperties.map(([property, description]) =>
    //@ts-expect-error(2339)
    firebot.factories.variables.createEventDataVariable(
      buildMastodonVariable(
        prefix.map((p) => `${p}${property}`),
        description,
        events,
      ),
    ),
  );
}

function buildMastodonPostVariables(
  prefix: string | string[],
  events: MastodonEvent[],
): Array<ReplaceVariable> {
  if (!Array.isArray(prefix)) {
    prefix = [prefix];
  }

  const postProperties: Array<[property: string, description: string]> = [
    [MastodonStatusVariable.Text, "The status's text"],
    [MastodonStatusVariable.Html, "The status's Html"],
    [MastodonStatusVariable.Uri, "The status's Uri"],
    [MastodonStatusVariable.Url, "The status's Url"],
    [MastodonStatusVariable.Id, "The status's id"],
    [MastodonStatusVariable.CreatedAt, "The status's creation date"],
    [
      MastodonStatusVariable.InReplyToId,
      "The id of the status being replied to (or `$null` if the status is not a reply)",
    ],
  ];

  return [
    ...postProperties.map(([property, description]) =>
      //@ts-expect-error(2339)
      firebot.factories.variables.createEventDataVariable(
        buildMastodonVariable(
          prefix.map((p) => `${p}${property}`),
          description,
          events,
        ),
      ),
    ),
    ...buildMastodonProfileVariables(
      [
        MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
        MASTODON_POST_AUTHOR_VARIABLE_PREFIX,
      ],
      events,
    ),
  ];
}

function buildMastodonVariable(
  eventProperty: string | string[],
  description: string,
  events: MastodonEvent[],
): VariableConfig & { aliases?: string[] } {
  if (!Array.isArray(eventProperty)) {
    eventProperty = [eventProperty];
  }

  const mainProperty = eventProperty.shift();
  if (!mainProperty) {
    throw new Error("No property provided to buildMastodonVariable");
  }

  return {
    handle: mainProperty,
    description: description,
    events: events.map((event) => `${MASTODON_PLUGIN_ID}:${event}`),
    eventMetaKey: mainProperty,
    type: "text",
    aliases: eventProperty,
  };
}
