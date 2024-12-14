import { logger } from "@oceanity/firebot-helpers/firebot";
import { mastodonIntegration } from "../mastodon-integration";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { Entity } from "megalodon";

type PostToMastodonData = {
  text: string;
  cw?: string;
  postVisibility?: Entity.StatusVisibility;
};

export const PostToMastodonEffectType: Effects.EffectType<
  PostToMastodonData,
  unknown,
  { postUri: string }
> = {
  definition: {
    id: "post-to-mastodon",
    name: "Post to Mastodon",
    description: "Posts a message to a Mastodon account",
    icon: "fad fa-at",
    categories: ["integrations"],
    outputs: [
      {
        label: "Post Uri",
        description: "The URI of the post",
        defaultName: "postUri",
      },
    ],
  },
  optionsTemplate: `
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
    if (!effect.text?.length) {
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

    try {
      await mastodonIntegration.client.postStatus(effect.text, {
        visibility: effect.postVisibility,
        spoiler_text: effect.cw,
      });
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      return {
        success: false,
      };
    }
  },
};

function validateEffect(
  data: PostToMastodonData
): [success: boolean, errorMessage?: string] {
  if (!data.text?.length) {
    return [false, "No text provided"];
  }

  return [true];
}
