import { AuthToken } from "tweeter-shared";
import { DaoFactory } from "../dao/DaoFactory";
import { Service } from "./Service";
import { AuthTokenData } from "../dao/AuthDao";

export class AuthService implements Service {
  readonly factory = new DaoFactory();
  readonly authDao = this.factory.getAuthDao();

  async checkAuthorization(token: string): Promise<void> {
    const response = await this.authDao.getAuthToken(token);
    if (!response || this.isExpired(response.timestamp)) {
      throw new Error("Unauthorized");
    }
    await this.refreshAuthToken(token);
  }

  private async refreshAuthToken(token: string) {
    await this.authDao.updateAuthTokenTimestamp(token, Date.now());
  }

  private isExpired(timestamp: number) {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    return now - timestamp > fifteenMinutes;
  }
}
