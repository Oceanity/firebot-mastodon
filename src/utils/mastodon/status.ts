import { MastodonService } from ".";
import { logger } from "../firebot";
import { getErrorMessage } from "../string";

export class MastodonStatusService {
  private _mastodon: MastodonService;

  constructor(mastodon: MastodonService) {
    this._mastodon = mastodon;
  }

  public async postStatus(
    status: string,
    visibility: MastodonStatusVisibility = "public"
  ) {
    try {
      logger.info(`Posting status: ${status}, visibility: ${visibility}`);

      await this._mastodon.api.fetch("/statuses", "POST", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          status,
          visibility,
        }).toString(),
      });
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }
}
