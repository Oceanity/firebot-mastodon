type MastodonScope = "read" | "write" | "follow" | "push" | "admin";

type MastodonAppRegistration = {
  id: string;
  name: string;
  website: string;
  scopes: MastodonScope[];
  redirect_uris: string[];
  vapid_key: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
};

type MastodonAppRegistrationFile = {
  [instance: string]: MastodonAppRegistration;
};

type MastodonStatusVisibility = "public" | "unlisted" | "private" | "direct";
