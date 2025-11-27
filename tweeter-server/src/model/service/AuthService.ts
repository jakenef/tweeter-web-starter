import { DaoFactory } from "../dao/DaoFactory";
import { Service } from "./Service";

export class AuthService implements Service {
  readonly factory = new DaoFactory();
  readonly authDao = this.factory.getAuthDao();

  async isAuthorized(token: string): Promise<boolean> {
    const response = await this.authDao.getAuthToken(token);
    if (response && !this.isExpired(response.timestamp)) {
      this.refreshAuthToken(token);
      return true;
    }
    return false;
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
