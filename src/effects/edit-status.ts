import firebot, { EffectType } from "@crowbartools/firebot-types";
import { mastodon } from "../main";
import optionsTemplate from "./edit-status.html";

type EffectModel = {
  statusId: string;
  text: string;
  cw?: string;
};

type OverlayData = {
  statusUri: string;
};

export const EditMastodonStatusEffect: EffectType<EffectModel, OverlayData> = {
  definition: {
    id: "edit-mastodon-status",
    name: "Edit Mastodon Status",
    description: "Edits a status on your Mastodon account",
    icon: "fad fa-pencil",
    categories: ["integrations"],
  },
  optionsTemplate,
  optionsValidator: (effect) => {
    const errors: Array<string> = [];
    if (!effect.statusId) {
      errors.push("Please enter a Status Id to edit!");
    }
    return errors;
  },
  getDefaultLabel: (effect) => {
    return `Editing Status: ${effect.statusId}`;
  },
  onTriggerEvent: async ({ effect }) => {
    try {
      if (!mastodon.restClient) {
        throw new Error("Mastodon client not initialized");
      }

      const { statusId, text, cw } = effect;

      await mastodon.restClient.v1.statuses.$select(statusId).update({
        status: text,
        spoilerText: cw,
      });

      return {
        success: true,
      };
    } catch (error) {
      firebot.logger.error("Could not edit status", error);
      return {
        success: false,
      };
    }
  },
};
