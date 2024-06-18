import { EventEmitter } from "events";
import { effectManager, integrationManager, logger } from "./utils/firebot";
import { getErrorMessage } from "./utils/string";
import { IntegrationDefinition } from "@crowbartools/firebot-custom-scripts-types";
import { integrationId } from "./main";
import { AllMastodonEffects } from "./firebot/effects";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

export const mastodonScopes = ["read", "write", "follow", "push"];
export let integration: MastodonIntegration;

export class MastodonIntegration extends EventEmitter {
  public connected: boolean = false;

  private _instance: string;

  constructor(instance: string) {
    super();
    this._instance = instance;
  }

  async init() {
    logger.info("Initializing Mastodon Integration...");

    // Register Effects
    for (const effect of AllMastodonEffects) {
      effectManager.registerEffect(
        effect as Effects.EffectType<{ [key: string]: any }>
      );
    }
  }

  async connect() {}

  async link() {}

  async unlink() {}

  async refreshToken(): Promise<AuthDefinition | null> {
    try {
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      return null;
    }
  }
}

export const generateMastodonDefinition = (
  instance: string,
  client: ClientCredentials
): IntegrationDefinition => ({
  id: integrationId,
  name: "Mastodon (by Oceanity",
  description:
    "Integrations with Mastodon that can read notifications and post messages",
  connectionToggle: true,
  linkType: "auth",
  settingCategories: {},
  authProviderDetails: {
    id: integrationId,
    name: "Mastodon",
    redirectUriHost: "localhost",
    client,
    auth: {
      //@ts-expect-error ts2535
      type: "code",
      authorizeHost: `https://${instance}`,
      authorizePath: "/oauth/authorize",
      tokenHost: `https://${instance}`,
      tokenPath: "/oauth/token",
    },
    autoRefreshToken: true,
    scopes: mastodonScopes.join(" "),
  },
});

export function generateSpotifyIntegration(instance: string) {
  integration = new MastodonIntegration(instance);
  return integration;
}

export const accessToken = () =>
  getMastodonAuthFromIntegration().access_token ?? "";

const getMastodonAuthFromIntegration = (): AuthDefinition =>
  integrationManager.getIntegrationById(integrationId).definition.auth;
