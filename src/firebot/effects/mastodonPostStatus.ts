import { mastodon } from "../../main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "../../utils/string";

type MastodonPostStatusOptions = {
  status: string;
  visibility: [MastodonStatusVisibility, string];
};

export const MastodonPostStatusEffect: Firebot.EffectType<MastodonPostStatusOptions> =
  {
    definition: {
      id: "oceanity-mastodon:post-status",
      name: "Mastodon: Post Status",
      description: "Posts status to linked Mastodon instance",
      icon: "fab fa-mastodon",
      categories: ["integrations"],
      //@ts-expect-error ts2353
      outputs: [
        {
          label: "Status",
          description: "Details about the posted status",
          defaultName: "status",
        },
      ],
    },

    optionsTemplate: `
    <eos-container header="New Status">
      <div style="margin: 15px 0;">
          <input ng-model="effect.status" type="text" class="form-control" id="chat-text-setting" placeholder="Status" menu-position="under" replace-variables/>
      </div>
      <div class="btn-group">
          <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="list-effect-type">{{effect.visibility ? effect.visibility[1] : 'Visibility'}}</span> <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
              <li ng-click="effect.visibility = ['public', 'Public']">
                  <a href>Public</a>
              </li>
              <li ng-click="effect.visibility = ['unlisted', 'Unlisted']">
                  <a href>Unlisted</a>
              </li>
              <li ng-click="effect.visibility = ['private', 'Private']">
                  <a href>Private</a>
              </li>
              <li ng-click="effect.visibility = ['direct', 'Direct']">
                  <a href>Direct</a>
              </li>
          </ul>
      </div>
    </eos-container>
  `,

    optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

    optionsValidator: (effect) => {
      const errors = [];
      if (!effect.status) {
        errors.push("Status is required!");
      }
      if (!effect.visibility) {
        errors.push("Visibility is required!");
      }
      return errors;
    },

    onTriggerEvent: async (event) => {
      const { status, visibility } = event.effect;

      try {
        await mastodon.status.postStatus(status, visibility[0]);
      } catch (error) {
        return {
          success: false,
          outputs: {
            playbackStateChanged: false,
            error: getErrorMessage(error),
          },
        };
      }
    },
  };
