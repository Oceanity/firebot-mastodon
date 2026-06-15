import firebot, { EffectType } from "@crowbartools/firebot-types";
import { StatusVisibility } from "masto/mastodon/entities/v1/status.js";
import { mastodon } from "../main";
import optionsTemplate from "./post-to-mastodon.html";

type EffectModel = {
  text: string;
  cw?: string;
  postVisibility?: StatusVisibility;
};

type OverlayData = {
  statusId: string;
  statusUri: string;
  statusUrl: string;
};

export const PostToMastodonEffectType: EffectType<EffectModel, OverlayData> = {
  definition: {
    id: "post-to-mastodon",
    name: "Post to Mastodon",
    description: "Posts a message to your Mastodon account",
    icon: "fad fa-at",
    categories: ["integrations"],
    outputs: [
      {
        label: "Post Id",
        description: "The Id of the post",
        defaultName: "statusId",
      },
      {
        label: "Post Uri",
        description: "The Uri of the post",
        defaultName: "statusUri",
      },
      {
        label: "Post Url",
        description: "The Url of the post",
        defaultName: "statusUrl",
      },
    ],
  },
  optionsTemplate,
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
    const errors: Array<string> = [];

    if (!effect.text?.length) {
      errors.push("Please enter some text to post!");
    }

    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    try {
      if (!mastodon.restClient) {
        throw new Error("Mastodon client not initialized");
      }

      const status = await mastodon.restClient.v1.statuses.create({
        status: effect.text,
        visibility: effect.postVisibility,
        spoilerText: effect.cw,
      });

      return {
        success: true,
        outputs: {
          statusId: status.id,
          statusUri: status.uri,
          statusUrl: status.url,
        },
      };
    } catch (error) {
      firebot.logger.error("Could not post status", error);
      return {
        success: false,
      };
    }
  },
};
