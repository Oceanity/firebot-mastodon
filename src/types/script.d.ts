type AuthDefinition = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_on: string;
  refresh_token: string;
  scope: string[];
};

type ClientCredentials = {
  id: string;
  secret: string;
};
