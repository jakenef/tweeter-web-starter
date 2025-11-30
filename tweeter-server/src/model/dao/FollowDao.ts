import { DataPage } from "../util/DataPage";

export interface FollowDao {
  createFollow(followerHandle: string, followeeHandle: string): Promise<void>;
  deleteFollow(followerHandle: string, followeeHandle: string): Promise<void>;
  getFollowingPage(
    followerHandle: string,
    limit: number,
    lastFolloweeHandle: string | undefined
  ): Promise<DataPage<string>>;
  getFollowersPage(
    followeeHandle: string,
    limit: number,
    lastFollowerHandle: string | undefined
  ): Promise<DataPage<string>>;
  isFollowing(followerHandle: string, followeeHandle: string): Promise<boolean>;
}
