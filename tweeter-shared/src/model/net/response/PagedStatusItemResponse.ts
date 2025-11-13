import { StatusDto } from "../../dto/StatusDto";
import { TweeterResponse } from "./TweeterResponse";

export interface PagedStatusItemResponse extends TweeterResponse {
  readonly statusList: StatusDto[] | null;
  readonly hasMore: boolean;
}
