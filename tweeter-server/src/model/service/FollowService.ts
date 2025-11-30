import { Service } from "./Service";
import { UserDto } from "tweeter-shared/src/model/dto/UserDto";
import { AuthService } from "./AuthService";

export class FollowService extends Service {
  private readonly authService = new AuthService();
  private readonly followDao = this.factory.getFollowDao();
  private readonly userDao = this.factory.getUserDao();

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authService.checkAuthorization(token);
    const aliasDataPage = await this.followDao.getFollowingPage(
      userAlias,
      pageSize,
      lastItem?.alias
    );
    const users = await this.userDao.getUsersByAliases(aliasDataPage.values);
    return [users.map((user) => user.dto), aliasDataPage.hasMorePages];
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authService.checkAuthorization(token);
    const aliasDataPage = await this.followDao.getFollowersPage(
      userAlias,
      pageSize,
      lastItem?.alias
    );
    const users = await this.userDao.getUsersByAliases(aliasDataPage.values);
    return [users.map((user) => user.dto), aliasDataPage.hasMorePages];
  }

  public async getFolloweeCount(token: string, user: UserDto): Promise<number> {
    await this.authService.checkAuthorization(token);
    const counts = await this.userDao.getFollowerAndFollowingCounts(user.alias);
    if (!counts) {
      throw new Error("Not found: User not found");
    }
    return counts.followingCount;
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {
    await this.authService.checkAuthorization(token);
    const counts = await this.userDao.getFollowerAndFollowingCounts(user.alias);
    if (!counts) {
      throw new Error("Not found: User not found");
    }
    return counts.followerCount;
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    await this.authService.checkAuthorization(token);
    const isFollower = await this.followDao.isFollowing(
      user.alias,
      selectedUser.alias
    );
    return isFollower;
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.authService.checkAuthorization(token);
    const followingUserAlias = await this.authService.getUserAliasFromToken(
      token
    );
    await this.followDao.createFollow(followingUserAlias!, userToFollow.alias);

    const followingUserCounts =
      await this.userDao.getFollowerAndFollowingCounts(followingUserAlias!);
    const userToFollowCounts = await this.userDao.getFollowerAndFollowingCounts(
      userToFollow.alias
    );

    if (!followingUserCounts || !userToFollowCounts) {
      throw new Error("Not found: The user to follow could not be found");
    }

    await this.userDao.updateUserFollowerCount(
      userToFollow.alias,
      userToFollowCounts?.followerCount + 1
    );
    await this.userDao.updateUserFollowingCount(
      followingUserAlias!,
      followingUserCounts.followingCount + 1
    );

    return [
      userToFollowCounts.followerCount + 1,
      userToFollowCounts.followingCount,
    ];
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.authService.checkAuthorization(token);
    const unfollowingUserAlias = await this.authService.getUserAliasFromToken(
      token
    );

    await this.followDao.deleteFollow(
      unfollowingUserAlias!,
      userToUnfollow.alias
    );

    const unfollowingUserCounts =
      await this.userDao.getFollowerAndFollowingCounts(unfollowingUserAlias!);
    const userToUnfollowCounts =
      await this.userDao.getFollowerAndFollowingCounts(userToUnfollow.alias);

    if (!unfollowingUserCounts || !userToUnfollowCounts) {
      throw new Error("Not found: The user to unfollow could not be found");
    }

    await this.userDao.updateUserFollowerCount(
      userToUnfollow.alias,
      Math.max(0, userToUnfollowCounts.followerCount - 1)
    );
    await this.userDao.updateUserFollowingCount(
      unfollowingUserAlias!,
      Math.max(0, unfollowingUserCounts.followingCount - 1)
    );

    return [
      Math.max(0, userToUnfollowCounts.followerCount - 1),
      Math.max(0, unfollowingUserCounts.followingCount - 1),
    ];
  }
}
