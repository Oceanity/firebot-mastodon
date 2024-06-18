import { MastodonApiService } from "./api";
import { MastodonStatusService } from "./status";

export class MastodonService {
  public readonly api: MastodonApiService;
  public readonly status: MastodonStatusService;

  private _instance: string;

  constructor(instance: string) {
    this._instance = instance;

    this.api = new MastodonApiService(this);
    this.status = new MastodonStatusService(this);
  }

  public get instance() {
    return this._instance;
  }
}
