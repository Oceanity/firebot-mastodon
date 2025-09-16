import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { mastodonIntegration } from "../mastodon-integration";

type EditMastodonStatusProps = {
  statusId: string;
  text: string;
  cw?: string;
};

export const EditMastodonStatusEffectType: Effects.EffectType<
  EditMastodonStatusProps,
  unknown,
  { statusUri: string }
> = {
  definition: {
    id: "edit-mastodon-status",
    name: "Edit Mastodon Status",
    description: "Edits a status on your Mastodon account",
    icon: "fad fa-pencil",
    categories: ["integrations"],
  },
  optionsTemplate: `
    <eos-container header="Status Id">
      <firebot-input
        model="effect.statusId"
        placeholder-text="Status Id"
        style="margin-bottom: 20px"
      />
    </eos-container>
    <eos-container header="Text"> 
      <firebot-input
        model="effect.text"
        use-text-area="true"
        placeholder-text="Status text"
        rows="4"
        cols="40"
        style="margin-bottom: 20px;" 
      />
      <firebot-input
        model="effect.cw"
        placeholder-text="Content warning"
      />
    </eos-container>
    <eos-container header="Visibility" pad-top="true">
      <div class="form-group">
        <firebot-radio-cards
          options="postVisibilityOptions"
          ng-model="effect.postVisibility"
          id="postVisibilityOptions"
          name="postVisibilityOptions"
          grid-columns="2"
        ></firebot-radio-cards>
      </div>
    </eos-container>
  `,
  optionsValidator: (effect) => {
    const errors: string[] = [];
    if (!effect.statusId) {
      errors.push("Please enter a Status Id to edit!");
    }
    if (!effect.text?.length) {
      errors.push("Please enter some text to post!");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    const [valid, reason] = validateEffect(effect);
    if (!valid) {
      logger.debug(
        `Unable to run Edit Mastodon Status effect: ${reason}`,
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
    const { statusId, text, cw } = effect;

    try {
      const response = await mastodonIntegration.client.editStatus(statusId, {
        status: text,
        spoiler_text: cw,
      });

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
  data: EditMastodonStatusProps
): [success: boolean, errorMessage?: string] {
  if (!data.statusId) {
    return [false, "No Status Id provided"];
  }
  if (!data.text?.length) {
    return [false, "No text provided"];
  }

  return [true];
}
