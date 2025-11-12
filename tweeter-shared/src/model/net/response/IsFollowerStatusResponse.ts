import { TweeterResponse } from "./TweeterResponse";

export interface IsFollowerStatusResponse extends TweeterResponse {
  isFollower: boolean;
}
