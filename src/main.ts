import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { initModules } from "./utils/firebot";
import {
  generateMastodonDefinition,
  generateSpotifyIntegration,
  mastodonScopes,
} from "./mastodonIntegration";
import { pathExists, readFile, writeFile } from "fs-extra";
import { resolve } from "path";
import { MastodonService } from "./utils/mastodon";

export const integrationId = "oceanity-mastodon";
export const localVersion = "0.1.0";
export let mastodon: MastodonService;

interface Params {
  instance: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Mastodon Integration (by Oceanity)",
      description: "Mastodon functionality in Firebot",
      author: "Oceanity",
      version: localVersion,
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      instance: {
        type: "string",
        default: "mastodon.social",
        description: "Instance Name",
        required: true,
        secondaryDescription:
          "Enter the Mastodon instance you want to authorize on",
      },
    };
  },
  run: async (runRequest) => {
    const { instance } = runRequest.parameters;
    const { integrationManager, logger } = runRequest.modules;
    logger.info(runRequest.parameters.instance);

    if (!instance) {
      logger.error("Missing required Instance");
      return;
    }

    initModules(runRequest.modules);

    let storedRegistrations;

    const client: ClientCredentials = {
      id: undefined,
      secret: undefined,
    };

    const filePath = resolve(__dirname, "mastodonAppRegistrations.json");
    if (await pathExists(filePath)) {
      storedRegistrations = JSON.parse(
        await readFile(filePath, "utf8")
      ) as MastodonAppRegistrationFile;

      if (storedRegistrations[instance]) {
        client.id = storedRegistrations[instance].client_id;
        client.secret = storedRegistrations[instance].client_secret;
      }
    }

    if (!client.id || !client.secret) {
      const response = await fetch(`https://${instance}/api/v1/apps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_name: "Firebot",
          redirect_uris: "http://localhost:7472/api/v1/auth/callback",
          scopes: mastodonScopes.join(" "),
          website: "https://oceanity.github.io",
        }).toString(),
      });

      if (!response.ok) {
        logger.error(
          `Could not access app registration endpoint on ${instance}`
        );
        return;
      }

      const data = (await response.json()) as MastodonAppRegistration;

      logger.info(JSON.stringify(data));

      client.id = data.client_id;
      client.secret = data.client_secret;

      if (!storedRegistrations) storedRegistrations = {};

      storedRegistrations[instance] = data;

      await writeFile(filePath, JSON.stringify(storedRegistrations, null, 2));
    }

    const [definition, integration] = [
      generateMastodonDefinition(instance, client),
      generateSpotifyIntegration(instance),
    ];

    logger.info(JSON.stringify(definition));
    logger.info(JSON.stringify(integration));

    integrationManager.registerIntegration({ definition, integration });

    mastodon = new MastodonService(instance);
  },
};

export default script;
