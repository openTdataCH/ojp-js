import { StageConfig } from "../../types/stage-config";
import { TripRequest } from "../trips-request/trips-request";
import { JourneyRequestParams } from "./journey-request-params";
import { RequestErrorData } from "../types/request-info.type";
import { TripRequest_ParserMessage, TripRequest_Response } from "../types/trip-request.type";
export type JourneyRequest_Message = 'JourneyRequest.DONE' | TripRequest_ParserMessage | 'ERROR';
export type JourneyRequest_Response = {
    sections: TripRequest_Response[];
    message: JourneyRequest_Message;
    error: RequestErrorData | null;
};
export type JourneyRequest_Callback = (response: JourneyRequest_Response) => void;
export declare class JourneyRequest {
    private stageConfig;
    private requestParams;
    tripRequests: TripRequest[];
    sections: TripRequest_Response[];
    constructor(stageConfig: StageConfig, requestParams: JourneyRequestParams);
    fetchResponse(callback: JourneyRequest_Callback): void;
    private computeTripResponse;
}
