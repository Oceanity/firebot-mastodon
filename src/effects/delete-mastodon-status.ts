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
  optionsController: ($scope) => {
    $scope.postVisibilityOptions = [
      {
        value: "public",
        label: "Public",
        description: "Visible for all",
        iconClass: "fa-globe",
      },
      {
        value: "unlisted",
        label: "Unlisted",
        description: "Visible for all, but opted-out of discovery",
        iconClass: "fa-unlock",
      },
      {
        value: "private",
        label: "Followers only",
        description: "Visible for followers only",
        iconClass: "fa-lock",
      },
      {
        value: "direct",
        label: "Direct",
        description: "Visible for mentioned users only",
        iconClass: "fa-at",
      },
    ];
  },
  optionsValidator: (effect) => {
    if (!effect.statusId?.length) {
      return ["Please enter some text to post!"];
    }
  },
  onTriggerEvent: async ({ effect }) => {
    const [valid, reason] = validateEffect(effect);
    if (!valid) {
      logger.debug(`Unable to run Post To Mastodon effect: ${reason}`, effect);
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

      logger.info(JSON.stringify(response));

      return {
        success: true,
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
    return [false, "No text provided"];
  }

  return [true];
}
