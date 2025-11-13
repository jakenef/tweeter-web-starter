import {
  AuthToken,
  User,
  PagedUserItemRequest,
  FollowCountRequest,
  IsFollowerStatusRequest,
} from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class FollowService implements Service {
  server = new ServerFacade();

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias,
      lastItem: lastItem?.dto ?? null,
      pageSize,
    };
    return this.server.getMoreFollowees(request);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias,
      lastItem: lastItem?.dto ?? null,
      pageSize,
    };
    return this.server.getMoreFollowers(request);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowCountRequest = {
      token: authToken.token,
      user: user.dto,
    };
    return this.server.getFolloweeCount(request);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowCountRequest = {
      token: authToken.token,
      user: user.dto,
    };
    return this.server.getFollowerCount(request);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const request: IsFollowerStatusRequest = {
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto,
    };
    return this.server.getIsFollowerStatus(request);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: FollowCountRequest = {
      token: authToken.token,
      user: userToFollow.dto,
    };

    const [followerCount, followeeCount] = await this.server.follow(request);

    return [followerCount, followeeCount];
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: FollowCountRequest = {
      token: authToken.token,
      user: userToUnfollow.dto,
    };

    const [followerCount, followeeCount] = await this.server.unfollow(request);

    return [followerCount, followeeCount];
  }
}
