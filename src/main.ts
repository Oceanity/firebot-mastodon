import {
  Firebot,
  Integration,
} from "@crowbartools/firebot-custom-scripts-types";
import {
  ReplaceVariableFactory,
  VariableConfig,
} from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-factory";
import { ReplaceVariableManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {
  effectManager,
  eventManager,
  initModules,
  integrationManager,
} from "@oceanity/firebot-helpers/firebot";
import {
  MASTODON_AUTHOR_VARIABLE_PREFIX,
  MASTODON_EVENT_SOURCE,
  MASTODON_INTEGRATION_AUTHOR,
  MASTODON_INTEGRATION_DEFINITION,
  MASTODON_INTEGRATION_DESCRIPTION,
  MASTODON_INTEGRATION_FIREBOT_VERSION,
  MASTODON_INTEGRATION_ID,
  MASTODON_INTEGRATION_NAME_AND_AUTHOR,
  MASTODON_INTEGRATION_VERSION,
  MASTODON_POST_VARIABLE_PREFIX,
} from "./constants";
import { AllMastodonEffectTypes } from "./effects";
import { initMastodonIntegration } from "./mastodon-integration";
import { MastodonEvent, MastodonIntegrationSettings } from "./types";

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
      "mastodonUser",
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
      MASTODON_POST_VARIABLE_PREFIX,
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
  prefix: string,
  events: MastodonEvent[],
  replaceVariableFactory: ReplaceVariableFactory
) {
  const profileProperties: Array<[property: string, description: string]> = [
    ["Handle", "The users's handle"],
    ["Username", "The user's username"],
    ["DisplayName", "The user's display name"],
    ["AvatarUrl", "The user's avatar URL"],
    ["BioHtml", "The user's bio with HTML formatting"],
    ["Bio", "The user's bio"],
    ["BannerUrl", "The user's banner URL"],
    ["Id", "The user's ID"],
    ["CreatedAt", "The user's creation date"],
  ];
  return profileProperties.map(([property, description]) =>
    replaceVariableFactory.createEventDataVariable(
      buildMastodonVariable(`${prefix}${property}`, description, events)
    )
  );
}

function buildMastodonPostVariables(
  prefix: string,
  events: MastodonEvent[],
  replaceVariableFactory: ReplaceVariableFactory
) {
  const postProperties: Array<[property: string, description: string]> = [
    ["Text", "The post's text"],
    ["Html", "The post's HTML"],
    ["Uri", "The post's URI"],
    ["Url", "The post's URL"],
    ["Id", "The post's ID"],
    ["CreatedAt", "The post's creation date"],
  ];
  return [
    ...postProperties.map(([property, description]) =>
      replaceVariableFactory.createEventDataVariable(
        buildMastodonVariable(`${prefix}${property}`, description, events)
      )
    ),
    ...buildMastodonProfileVariables(
      MASTODON_AUTHOR_VARIABLE_PREFIX,
      events,
      replaceVariableFactory
    ),
  ];
}

function buildMastodonVariable(
  eventProperty: string,
  description: string,
  events: MastodonEvent[]
): VariableConfig {
  return {
    handle: eventProperty,
    description: description,
    events: events.map((event) => `${MASTODON_INTEGRATION_ID}:${event}`),
    eventMetaKey: eventProperty,
    type: "text",
  };
}

export default script;
