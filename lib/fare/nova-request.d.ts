import { RequestInfo } from "../request";
import { Trip } from "../trip";
import { NovaFare_Response } from "./nova-request-parser";
import { ApiConfig } from '../types/stage-config';
import { XML_Config } from '../types/_all';
import { Language } from '../types/language-type';
export declare class NovaRequest {
    private stageConfig;
    private language;
    private xmlConfig;
    private requestorRef;
    requestInfo: RequestInfo;
    constructor(stageConfig: ApiConfig, language?: Language, xmlConfig?: XML_Config, requestorRef?: string);
    fetchResponseForTrips(trips: Trip[]): Promise<NovaFare_Response>;
    private buildServiceRequestNode;
    private addTripToServiceRequestNode;
    private fetchResponse;
}
