import * as xmlbuilder from "xmlbuilder";
import { ApiConfig } from '../types/stage-config';
import { RequestInfo } from './types/request-info.type';
import { Language } from '../types/language-type';
export declare class OJPBaseRequest {
    private stageConfig;
    private language;
    protected serviceRequestNode: xmlbuilder.XMLElement;
    requestInfo: RequestInfo;
    logRequests: boolean;
    protected mockRequestXML: string | null;
    protected mockResponseXML: string | null;
    constructor(stageConfig: ApiConfig, language: Language);
    private buildRequestXML;
    updateRequestXML(): void;
    protected fetchOJPResponse(): Promise<RequestInfo>;
    private computeBaseServiceRequestNode;
    protected buildRequestNode(): void;
}
