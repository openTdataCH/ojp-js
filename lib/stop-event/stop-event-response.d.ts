import { StopEvent } from './stop-event';
import { RequestErrorData } from '../request/request-error';
type StopEventResponseMessage = 'StopEvent.DONE' | 'ERROR';
export declare class StopEventResponse {
    stopEvents: StopEvent[];
    error: RequestErrorData | null;
    constructor();
    parseXML(responseXMLText: string, callback: (message: StopEventResponseMessage) => void): void;
}
export {};
