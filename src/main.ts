import {
  Firebot,
  Integration,
} from "@crowbartools/firebot-custom-scripts-types";
import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import {
  ReplaceVariableFactory,
  VariableConfig,
} from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-factory";
import { ReplaceVariableManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {
  effectManager,
  eventFilterManager,
  eventManager,
  initModules,
  integrationManager,
} from "@oceanity/firebot-helpers/firebot";
import {
  MASTODON_EVENT_SOURCE,
  MASTODON_INTEGRATION_AUTHOR,
  MASTODON_INTEGRATION_DEFINITION,
  MASTODON_INTEGRATION_DESCRIPTION,
  MASTODON_INTEGRATION_FIREBOT_VERSION,
  MASTODON_INTEGRATION_ID,
  MASTODON_INTEGRATION_NAME_AND_AUTHOR,
  MASTODON_INTEGRATION_VERSION,
  MASTODON_POST_AUTHOR_VARIABLE_PREFIX,
  MASTODON_POST_VARIABLE_PREFIX,
  MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
  MASTODON_STATUS_VARIABLE_PREFIX,
  MASTODON_USER_VARIABLE_PREFIX,
} from "./constants";
import { AllMastodonEffectTypes } from "./effects";
import { AllMastodonEventFilters } from "./filters";
import { initMastodonIntegration } from "./mastodon-integration";
import {
  MastodonEvent,
  MastodonIntegrationSettings,
  MastodonStatusVariable,
  MastodonUserVariable,
} from "./types";

const script: Firebot.CustomScript = {
  getScriptManifest: () => {
    return {
      name: MASTODON_INTEGRATION_NAME_AND_AUTHOR,
      description: MASTODON_INTEGRATION_DESCRIPTION,
      author: MASTODON_INTEGRATION_AUTHOR,
      version: MASTODON_INTEGRATION_VERSION,
      firebotVersion: MASTODON_INTEGRATION_FIREBOT_VERSION,
    };
  },
  getDefaultParameters: () => ({}),
  run: async (runRequest) => {
    initModules(runRequest.modules);

    eventManager.registerEventSource(MASTODON_EVENT_SOURCE);

    registerMastodonVariables(
      runRequest.modules.replaceVariableFactory,
      runRequest.modules.replaceVariableManager
    );

    for (const filter of AllMastodonEventFilters) {
      eventFilterManager.registerFilter(filter as EventFilter);
    }

    const integration: Integration<MastodonIntegrationSettings> = {
      definition: MASTODON_INTEGRATION_DEFINITION,
      integration: initMastodonIntegration(),
    };

    integrationManager.registerIntegration(integration);

    for (const effectType of AllMastodonEffectTypes) {
      effectType.definition.id = `${MASTODON_INTEGRATION_ID}:${effectType.definition.id}`;
      effectManager.registerEffect(effectType as any);
    }
  },
};

function registerMastodonVariables(
  replaceVariableFactory: ReplaceVariableFactory,
  replaceVariableManager: ReplaceVariableManager
) {
  const mastodonVariables = [
    ...buildMastodonProfileVariables(
      MASTODON_USER_VARIABLE_PREFIX,
      [
        MastodonEvent.Follow,
        MastodonEvent.Like,
        MastodonEvent.Boost,
        MastodonEvent.Mention,
        MastodonEvent.Reply,
      ],
      replaceVariableFactory
    ),
    ...buildMastodonPostVariables(
      [MASTODON_STATUS_VARIABLE_PREFIX, MASTODON_POST_VARIABLE_PREFIX],
      [
        MastodonEvent.Like,
        MastodonEvent.Boost,
        MastodonEvent.Mention,
        MastodonEvent.Reply,
      ],
      replaceVariableFactory
    ),
  ];
  for (const variable of mastodonVariables) {
    replaceVariableManager.registerReplaceVariable(variable);
  }
}

function buildMastodonProfileVariables(
  prefix: string | string[],
  events: MastodonEvent[],
  replaceVariableFactory: ReplaceVariableFactory
) {
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
    replaceVariableFactory.createEventDataVariable(
      buildMastodonVariable(
        prefix.map((p) => `${p}${property}`),
        description,
        events
      )
    )
  );
}

function buildMastodonPostVariables(
  prefix: string | string[],
  events: MastodonEvent[],
  replaceVariableFactory: ReplaceVariableFactory
) {
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
      replaceVariableFactory.createEventDataVariable(
        buildMastodonVariable(
          prefix.map((p) => `${p}${property}`),
          description,
          events
        )
      )
    ),
    ...buildMastodonProfileVariables(
      [
        MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX,
        MASTODON_POST_AUTHOR_VARIABLE_PREFIX,
      ],
      events,
      replaceVariableFactory
    ),
  ];
}

function buildMastodonVariable(
  eventProperty: string | string[],
  description: string,
  events: MastodonEvent[]
): VariableConfig & { aliases?: string[] } {
  if (!Array.isArray(eventProperty)) {
    eventProperty = [eventProperty];
  }

  const mainProperty = eventProperty.shift();

  return {
    handle: mainProperty,
    description: description,
    events: events.map((event) => `${MASTODON_INTEGRATION_ID}:${event}`),
    eventMetaKey: mainProperty,
    type: "text",
    aliases: eventProperty,
  };
}

export default script;
