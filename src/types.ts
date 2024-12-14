export type MastodonIntegrationSettings = {
  account: {
    instanceType?:
      | "mastodon"
      | "pleroma"
      | "friendica"
      | "firefish"
      | "gotosocial";
    baseUrl: string;
    accessToken: string;
  };
};

export enum MastodonEvent {
  Follow = "follow",
  Like = "like",
  Boost = "boost",
  Mention = "mention",
  Reply = "reply",
}
