import { UserDto } from "../../dto/UserDto";

export interface FollowCountRequest {
  readonly user: UserDto;
  readonly token: string;
}
