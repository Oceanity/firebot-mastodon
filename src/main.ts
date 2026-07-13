import firebot, { Plugin, PluginContext } from "@crowbartools/firebot-types";
import { createRestAPIClient, createStreamingAPIClient } from "masto";

import {
  MASTODON_EVENT_SOURCE,
  MASTODON_PLUGIN_AUTHOR,
  MASTODON_PLUGIN_DESCRIPTION,
  MASTODON_PLUGIN_ICON_DATA_URI,
  MASTODON_PLUGIN_NAME,
  MASTODON_PLUGIN_VERSION,
} from "./constants";
import { AllMastodonEffectTypes } from "./effects";
import { hookMastodonFirebotEvents } from "./event-handler";
import { AllMastodonEventFilters } from "./filters";
import { AllMastodonReplaceVariables } from "./replace-variables";
import { MastodonState } from "./types";

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
    name: MASTODON_PLUGIN_NAME,
    description: MASTODON_PLUGIN_DESCRIPTION,
    icon: {
      type: "custom",
      url: MASTODON_PLUGIN_ICON_DATA_URI,
      backgroundColor: "linear-gradient(180deg,#6364ff,#563acc)",
    },
    author: MASTODON_PLUGIN_AUTHOR,
    version: MASTODON_PLUGIN_VERSION,
    repo: "https://github.com/Oceanity/firebot-mastodon",
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
    await connect(context);
  },
  onParameterUpdate: async (context) => {
    await connect(context);
  },
  onUnload: async () => {
    await disconnect();
  },
};

const connect = async (context: PluginContext<Params>): Promise<void> => {
  disconnect();

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
    disconnect();

    firebot.logger.error("Error connecting to Mastodon Rest client", error);
  }
};

const disconnect = (): void => {
  mastodon.restClient = null;
  mastodon.streamingClient?.close();
  mastodon.streamingClient = null;
  mastodon.instanceUrl = null;
  mastodon.account = null;
};

export default plugin;
