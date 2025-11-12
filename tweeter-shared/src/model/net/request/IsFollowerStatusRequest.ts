import { UserDto } from "../../dto/UserDto";

export interface IsFollowerStatusRequest {
  readonly token: string;
  readonly user: UserDto;
  readonly selectedUser: UserDto;
}
