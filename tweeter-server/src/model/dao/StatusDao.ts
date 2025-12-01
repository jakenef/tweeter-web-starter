import { Status } from "tweeter-shared";
import { DataPage } from "../util/DataPage";

export interface StatusDao {
  createStoryStatus(status: Status): Promise<void>;
  createFeedStatus(status: Status, feedOwnerAlias: string): Promise<void>;
  getStoryPageByAlias(
    userAlias: string,
    limit: number,
    lastTimestamp?: number
  ): Promise<DataPage<Status>>;
  getFeedPageByAlias(
    userAlias: string,
    limit: number,
    lastTimestamp?: number
  ): Promise<DataPage<Status>>;
}
