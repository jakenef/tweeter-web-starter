import { AuthToken } from "tweeter-shared";
import { DaoFactory } from "../dao/DaoFactory";
import { Service } from "./Service";
import { v4 as uuidv4 } from "uuid";

export class AuthService implements Service {
  private readonly factory = new DaoFactory();
  private readonly authDao = this.factory.getAuthDao();

  async checkAuthorization(token: string): Promise<void> {
    const response = await this.authDao.getAuthToken(token);
    if (!response || this.isExpired(response.timestamp)) {
      throw new Error("Unauthorized");
    }
    await this.refreshAuthToken(token);
  }

  async createAuthToken(alias: string): Promise<AuthToken> {
    const token = uuidv4();
    const now = Date.now();
    await this.authDao.createAuthToken(token, alias, now);
    return new AuthToken(token, now);
  }

  async deleteAuthToken(token: string) {
    await this.authDao.deleteAuthToken(token);
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
