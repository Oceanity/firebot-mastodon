import firebot, { EffectType } from "@crowbartools/firebot-types";
import { mastodon } from "../main";

type EffectModel = {
  statusId: string;
};

export const DeleteMastodonStatusEffectType: EffectType<EffectModel> = {
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
    const errors: Array<string> = [];

    if (!effect.statusId?.length) {
      errors.push("Please enter some text to post!");
    }

    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    try {
      if (!mastodon.restClient) {
        throw new Error("Mastodon client not initialized");
      }

      await mastodon.restClient.v1.statuses.$select(effect.statusId).remove();

      return {
        success: true,
      };
    } catch (error) {
      firebot.logger.error("Error deleting Mastodon status", error);

      return {
        success: false,
      };
    }
  },
};
