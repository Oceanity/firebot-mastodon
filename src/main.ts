import firebot, { Plugin, PluginContext } from "@crowbartools/firebot-types";
import { createRestAPIClient, createStreamingAPIClient } from "masto";
import { Client as RestClient } from "masto/mastodon/rest/client.js";

import { Account } from "masto/mastodon/entities/v1/account.js";
import { Client as StreamingClient } from "masto/mastodon/streaming/client.js";
import {
  MASTODON_EVENT_SOURCE,
  MASTODON_INTEGRATION_AUTHOR,
  MASTODON_INTEGRATION_DESCRIPTION,
  MASTODON_INTEGRATION_NAME,
  MASTODON_INTEGRATION_VERSION,
  MASTODON_PLUGIN_ICON_DATA_URI,
} from "./constants";
import { AllMastodonEffectTypes } from "./effects";
import { hookMastodonFirebotEvents } from "./event-handler";
import { AllMastodonEventFilters } from "./filters";
import { AllMastodonReplaceVariables } from "./replace-variables";

export interface MastodonState {
  restClient: RestClient | null;
  streamingClient: StreamingClient | null;
  account: Account | null;
  instanceUrl: URL | null;
}

export let mastodon: MastodonState = {
  restClient: null,
  streamingClient: null,
  account: null,
  instanceUrl: null,
};

type Params = {
  instanceUrl: string;
  accessToken: string;
};

const plugin: Plugin<Params> = {
  manifest: {
    name: MASTODON_INTEGRATION_NAME,
    description: MASTODON_INTEGRATION_DESCRIPTION,
    icon: {
      type: "custom",
      url: MASTODON_PLUGIN_ICON_DATA_URI,
      backgroundColor:
        "linear-gradient(180deg,rgba(99, 100, 255, 1) 0%, rgba(86, 58, 204, 1) 100%)",
    },
    author: MASTODON_INTEGRATION_AUTHOR,
    version: MASTODON_INTEGRATION_VERSION,
  },
  parametersSchema: [
    {
      name: "instanceUrl",
      title: "Instance Url",
      description:
        "The base url of your Mastodon instance, eg. mastodon.social",
      type: "string",
      default: "",
    },
    {
      name: "accessToken",
      title: "Access Token",
      description:
        "The access token for your Mastodon account, get one from the Developers section of Settings",
      type: "password",
      default: "",
    },
  ],
  registers: {
    effects: AllMastodonEffectTypes,
    eventSources: [MASTODON_EVENT_SOURCE],
    filters: AllMastodonEventFilters,
    variables: AllMastodonReplaceVariables,
  },
  onLoad: async (context: PluginContext<Params>) => {
    connectMastodonClients(context);
  },
  onParameterUpdate(context) {
    connectMastodonClients(context);
  },
  onUnload: async () => {
    close();
  },
};

const connectMastodonClients = async (
  context: PluginContext<Params>,
): Promise<void> => {
  close();

  if (!context.parameters.accessToken || !context.parameters.instanceUrl) {
    firebot.logger.warn(
      "Parameters 'accessToken' and 'instanceUrl' are required",
    );
    return;
  }

  const { accessToken, instanceUrl } = context.parameters;

  mastodon.instanceUrl = new URL(
    /^https?:\/\//i.test(instanceUrl) ? instanceUrl : `https://${instanceUrl}`,
  );

  try {
    mastodon.restClient = createRestAPIClient({
      url: mastodon.instanceUrl.toString(),
      accessToken: accessToken,
    });

    // Will throw if invalid
    const credentials =
      await mastodon.restClient.v1.accounts.verifyCredentials();
    mastodon.account = await mastodon.restClient.v1.accounts
      .$select(credentials.id)
      .fetch();

    mastodon.streamingClient = createStreamingAPIClient({
      streamingApiUrl: context.parameters.instanceUrl,
      accessToken: context.parameters.accessToken,
    });

    hookMastodonFirebotEvents(mastodon.streamingClient);

    firebot.logger.info("Successfully connected to Mastodon!");
  } catch (error) {
    close();

    firebot.logger.error("Error connecting to Mastodon Rest client", error);
  }
};

const close = (): void => {
  mastodon.restClient = null;
  mastodon.streamingClient?.close();
  mastodon.streamingClient = null;
  mastodon.instanceUrl = null;
  mastodon.account = null;
};

export default plugin;
