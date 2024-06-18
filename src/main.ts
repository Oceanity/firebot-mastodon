import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

interface Params {
  instance: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Mastodon Integration (by Oceanity)",
      description: "Mastodon functionality in Firebot",
      author: "Oceanity",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      instance: {
        type: "string",
        default: "mastodon.social",
        description: "Instance Name",
        secondaryDescription:
          "Enter the Mastodon instance you want to authorize on",
      },
    };
  },
  run: (runRequest) => {
    const { logger } = runRequest.modules;
    logger.info(runRequest.parameters.instance);
  },
};

export default script;
