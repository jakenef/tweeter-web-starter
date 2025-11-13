import {
  AuthToken,
  Status,
  PagedStatusItemRequest,
  PostStatusRequest,
} from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class StatusService implements Service {
  server = new ServerFacade();

  loadMoreStoryItems = async (
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> => {
    const request: PagedStatusItemRequest = {
      token: authToken.token,
      userAlias,
      pageSize,
      lastItem: lastItem?.dto ?? null,
    };
    return this.server.getStory(request);
  };

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: PagedStatusItemRequest = {
      token: authToken.token,
      userAlias,
      pageSize,
      lastItem: lastItem?.dto ?? null,
    };
    return this.server.getFeed(request);
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    const request: PostStatusRequest = {
      token: authToken.token,
      newStatus: newStatus.dto,
    };

    return this.server.postStatus(request);
  }
}
