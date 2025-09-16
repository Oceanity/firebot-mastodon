import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { mastodonIntegration } from "../mastodon-integration";

type DeleteMastodonProps = {
  statusId: string;
};

export const DeleteMastodonStatusEffectType: Effects.EffectType<
  DeleteMastodonProps,
  unknown
> = {
  definition: {
    id: "delete-mastodon-status",
    name: "Delete Mastodon Status",
    description: "Deletes a status from your Mastodon account",
    icon: "fad fa-trash-alt",
    categories: ["integrations"],
  },
  optionsTemplate: `
    <eos-container header="Status Id"> 
      <firebot-input
        model="effect.statusId"
        placeholder-text="Status Id to delete"
        style="margin-bottom: 20px;" 
      />
    </eos-container>
  `,
  optionsValidator: (effect) => {
    if (!effect.statusId?.length) {
      return ["Please enter some text to post!"];
    }
  },
  onTriggerEvent: async ({ effect }) => {
    const [valid, reason] = validateEffect(effect);
    if (!valid) {
      logger.debug(
        `Unable to run Delete Mastodon Status effect: ${reason}`,
        effect
      );
      return {
        success: false,
      };
    }

    if (!mastodonIntegration?.client) {
      logger.error("Mastodon client not initialized");
      return {
        success: false,
      };
    }

    const { statusId } = effect;

    try {
      const response = await mastodonIntegration.client.deleteStatus(statusId);

      return {
        success: response.status === 200,
      };
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      return {
        success: false,
      };
    }
  },
};

function validateEffect(
  data: DeleteMastodonProps
): [success: boolean, errorMessage?: string] {
  if (!data.statusId?.length) {
    return [false, "No Status Id provided"];
  }

  return [true];
}
