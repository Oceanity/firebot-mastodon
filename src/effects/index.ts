import { EffectType } from "@crowbartools/firebot-types";
import { DeleteMastodonStatusEffectType } from "./delete-status";
import { EditMastodonStatusEffectType } from "./edit-status";
import { PostToMastodonEffectType } from "./post-to-mastodon";

export const AllMastodonEffectTypes: Array<EffectType<any, any>> = [
  DeleteMastodonStatusEffectType,
  EditMastodonStatusEffectType,
  PostToMastodonEffectType,
];
