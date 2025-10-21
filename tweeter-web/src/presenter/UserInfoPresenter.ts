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
    await this.doUserFollowAction(
      displayedUser,
      authToken,
      "Following",
      "follow user",
      (token, user) => this.followService.follow(token, user),
      true
    );
  }

  public async unfollowDisplayedUser(
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    await this.doUserFollowAction(
      displayedUser,
      authToken,
      "Unfollowing",
      "unfollow user",
      (token, user) => this.followService.unfollow(token, user),
      false
    );
  }

  private async doUserFollowAction(
    displayedUser: User,
    authToken: AuthToken,
    actionDesc: string,
    errorActionDesc: string,
    actionCall: (
      authToken: AuthToken,
      displayedUser: User
    ) => Promise<[followerCount: number, followeeCount: number]>,
    isFollower: boolean
  ) {
    let followingUserToast: string | null = null;
    await this.doFailureReportingOperation(async () => {
      followingUserToast = this.view.displayInfoMessage(
        `${actionDesc} ${displayedUser!.name}...`,
        0
      );

      const [followerCount, followeeCount] = await actionCall(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(isFollower);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, errorActionDesc);
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
