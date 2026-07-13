import { EffectType } from "@crowbartools/firebot-types";
import { MASTODON_PLUGIN_ID } from "../constants";
import { DeleteMastodonStatusEffect } from "./delete-status";
import { EditMastodonStatusEffect } from "./edit-status";
import { PostToMastodonEffect } from "./post-to-mastodon";

export const AllMastodonEffects: Array<EffectType<any, any>> = [
  DeleteMastodonStatusEffect,
  EditMastodonStatusEffect,
  PostToMastodonEffect,
].map((effect) => {
  effect.definition.id = `${MASTODON_PLUGIN_ID}:${effect.definition.id}`;

  return effect;
});
