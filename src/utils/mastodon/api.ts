import { MastodonService } from ".";
import { accessToken } from "../../mastodonIntegration";
import { logger } from "../firebot";
import { mergeObjects } from "../objects";
import { getErrorMessage } from "../string";

export class MastodonApiService {
  private _mastodon: MastodonService;

  constructor(mastodon: MastodonService) {
    this._mastodon = mastodon;
  }

  public async fetch<T>(path: string, method: string = "GET", options?: any) {
    const url = this.getUrlFromPath(path);
    const token = accessToken();

    logger.info(
      `Making ${method} request to ${url}, Bearer ${token}, Options ${JSON.stringify(
        options
      )}`
    );

    try {
      const response = await fetch(
        `https://${this._mastodon.instance}/api/v1${path}`,
        {
          method,
          ...mergeObjects(
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
            options
          ),
        }
      );

      if (!response.ok) {
        throw new Error(`Mastodon API ${path} returned ${response.status}`);
      }

      console.log(JSON.stringify(await response.json()));
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  private getUrlFromPath = (path: string) =>
    `https://${this._mastodon.instance}/api/v1${path}`;
}
