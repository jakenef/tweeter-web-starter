import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter, View } from "./Presenter";

export interface UserInfoView extends MessageView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (followCount: number) => void;
  setFollowerCount: (followCount: number) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private followService: FollowService = new FollowService();

  constructor(view: UserInfoView) {
    super(view);
  }

  public async followDisplayedUser(displayedUser: User, authToken: AuthToken) {
    var followingUserToast;
    await this.doFailureReportingOperation(async () => {
      followingUserToast = this.view.displayInfoMessage(
        `Following ${displayedUser!.name}...`,
        0
      );

      const [followerCount, followeeCount] = await this.followService.follow(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(true);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, "follow user");
    this.view.deleteMessage(followingUserToast!);
  }

  public async unfollowDisplayedUser(
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    var unfollowingUserToast;
    await this.doFailureReportingOperation(async () => {
      unfollowingUserToast = this.view.displayInfoMessage(
        `Unfollowing ${displayedUser!.name}...`,
        0
      );

      const [followerCount, followeeCount] = await this.followService.unfollow(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(false);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, "unfollow user");
    this.view.deleteMessage(unfollowingUserToast!);
  }

  private async doUserFollowAction(
    displayedUser: User,
    authToken: AuthToken,
    isFollow: boolean
  ) {
    let actionDesc: string = "";
    let actionCall: (
      authToken: AuthToken,
      displayedUser: User
    ) => Promise<[followerCount: number, followeeCount: number]>;

    var followingUserToast;
    await this.doFailureReportingOperation(async () => {
      followingUserToast = this.view.displayInfoMessage(
        `${actionDesc} ${displayedUser!.name}...`,
        0
      );

      // const [followerCount, followeeCount] = await actionCall(
      //   authToken!,
      //   displayedUser!
      // );

      // this.view.setIsFollower(true);
      // this.view.setFollowerCount(followerCount);
      // this.view.setFolloweeCount(followeeCount);
    }, "follow user");
    this.view.deleteMessage(followingUserToast!);
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!
          )
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    await this.doFailureReportingOperation(async () => {
      this.view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser)
      );
    }, "get followees");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    await this.doFailureReportingOperation(async () => {
      this.view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser)
      );
    }, "get followers count");
  }
}
