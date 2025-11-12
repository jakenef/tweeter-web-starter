import { UserDto } from "../../dto/UserDto";

export interface IsFollowerStatusRequest {
  token: string;
  user: UserDto;
  selectedUser: UserDto;
}
