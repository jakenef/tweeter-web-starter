import { LoginResponse, RegisterRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: RegisterRequest
): Promise<LoginResponse> => {
  const userService = new UserService();

  const [user, authToken] = await userService.register(
    request.firstName,
    request.lastName,
    request.alias,
    request.password,
    request.userImageBytes,
    request.imageFileExtension
  );

  const response: LoginResponse = {
    success: true,
    message: null,
    user,
    authToken,
  };

  return response;
};
