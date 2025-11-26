export type AuthTokenData = {
  token: string;
  userAlias: string;
  timestamp: number;
};

export interface AuthDao {
  createAuthToken(
    token: string,
    userAlias: string,
    timestamp: number
  ): Promise<void>;
  deleteAuthToken(token: string): Promise<void>;
  getAuthToken(token: string): Promise<AuthTokenData | null>;
  updateAuthTokenTimestamp(token: string, timestamp: number): Promise<void>;
}
