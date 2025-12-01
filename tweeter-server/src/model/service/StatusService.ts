import { Status, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { AuthService } from "./AuthService";

export class StatusService extends Service {
  private readonly authService = new AuthService();
  private readonly statusDao = this.factory.getStatusDao();
  private readonly followDao = this.factory.getFollowDao();

  loadMoreStoryItems = async (
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> => {
    await this.authService.checkAuthorization(token);
    const pageOfStatuses = await this.statusDao.getStoryPageByAlias(
      userAlias,
      pageSize,
      lastItem?.timestamp
    );
    return [
      pageOfStatuses.values.map((status) => status.dto),
      pageOfStatuses.hasMorePages,
    ];
  };

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    await this.authService.checkAuthorization(token);
    const pageOfStatuses = await this.statusDao.getFeedPageByAlias(
      userAlias,
      pageSize,
      lastItem?.timestamp
    );
    return [
      pageOfStatuses.values.map((status) => status.dto),
      pageOfStatuses.hasMorePages,
    ];
  }

  public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
    await this.authService.checkAuthorization(token);

    const authorAlias = await this.authService.getUserAliasFromToken(token);
    const status = Status.fromDto(newStatus);

    await this.statusDao.createStoryStatus(status!);

    const followersPage = await this.followDao.getFollowersPage(
      authorAlias!,
      Number.MAX_SAFE_INTEGER,
      undefined
    );
    const followerAliases = followersPage.values;

    for (const followerAlias of followerAliases) {
      await this.statusDao.createFeedStatus(
        new Status(status?.post!, status?.user!, status?.timestamp!),
        followerAlias
      );
    }
  }
}
