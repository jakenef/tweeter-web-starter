import { Status, FakeData, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { AuthService } from "./AuthService";

export class StatusService extends Service {
  private readonly authService = new AuthService();
  private readonly statusDao = this.factory.getStatusDao();

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
    // TODO: Call the server to post the status
  }
}
