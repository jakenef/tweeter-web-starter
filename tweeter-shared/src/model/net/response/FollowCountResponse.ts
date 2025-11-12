import { TweeterResponse } from "./TweeterResponse";

export interface FollowCountResponse extends TweeterResponse {
  count: number;
}
