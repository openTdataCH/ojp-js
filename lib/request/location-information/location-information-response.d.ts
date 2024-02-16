import { Location } from '../../location/location';
import { RequestErrorData } from '../request-error';
type LocationInformationResponseMessage = 'LocationInformation.DONE' | 'ERROR';
export type LocationInformationResponseCallback = (locations: Location[], message: LocationInformationResponseMessage) => void;
export declare class LocationInformationResponse {
    locations: Location[];
    error: RequestErrorData | null;
    constructor();
    parseXML(responseXMLText: string, callback: LocationInformationResponseCallback): void;
}
export {};
