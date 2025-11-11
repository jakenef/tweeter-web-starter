import { PagedUserItemRequest } from "tweeter-shared/src/model/net/request/PagedUserItemRequest";
import { PagedUserItemResponse } from "tweeter-shared/src/model/net/response/PagedUserItemResponse";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: PagedUserItemRequest
): Promise<PagedUserItemResponse> => {
  const followService = new FollowService();
  const [items, hasMore] = await followService.loadMoreFollowees(
    request.token,
    request.userAlias,
    request.pageSize,
    request.lastItem
  );

  const response: PagedUserItemResponse = {
    success: true,
    message: null,
    items: items,
    hasMore: hasMore,
  };

  return response;
};
