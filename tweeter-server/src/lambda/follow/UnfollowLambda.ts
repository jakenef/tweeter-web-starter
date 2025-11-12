import { FollowCountRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowCountRequest
): Promise<FollowResponse> => {
  const followService = new FollowService();
  const [followerCount, followeeCount] = await followService.unfollow(
    request.token,
    request.user
  );

  const response: FollowResponse = {
    success: true,
    message: null,
    followerCount,
    followeeCount,
  };

  return response;
};
