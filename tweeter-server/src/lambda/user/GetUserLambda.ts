import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  const userService = new UserService();
  const user = await userService.getUser(request.token, request.alias);

  const response: GetUserResponse = {
    success: true,
    message: null,
    user,
  };

  return response;
};
