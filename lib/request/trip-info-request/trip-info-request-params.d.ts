import { BaseRequestParams } from '../base-request-params';
export declare class TripInfoRequestParams extends BaseRequestParams {
    journeyRef: string;
    operatingDayRef: string;
    constructor(journeyRef: string, operatingDayRef: string);
    static Empty(): TripInfoRequestParams;
    protected buildRequestNode(): void;
}
