import { FollowCountRequest, FollowCountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowCountRequest
): Promise<FollowCountResponse> => {
  const followService = new FollowService();
  const count = await followService.getFollowerCount(
    request.token,
    request.user
  );

  const response: FollowCountResponse = {
    success: true,
    message: null,
    count,
  };

  return response;
};
