import { DeleteMastodonStatusEffectType } from "./delete-mastodon-status";
import { EditMastodonStatusEffectType } from "./edit-status";
import { PostToMastodonEffectType } from "./post-to-mastodon";

export const AllMastodonEffectTypes = [
  DeleteMastodonStatusEffectType,
  EditMastodonStatusEffectType,
  PostToMastodonEffectType,
];
