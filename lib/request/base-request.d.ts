import * as xmlbuilder from "xmlbuilder";
import { ApiConfig } from '../types/stage-config';
import { RequestInfo } from './types/request-info.type';
import { Language } from '../types/language-type';
import { XML_Config } from '../types/_all';
export declare class OJPBaseRequest {
    private stageConfig;
    private language;
    protected xmlConfig: XML_Config;
    private requestorRef;
    protected serviceRequestNode: xmlbuilder.XMLElement;
    requestInfo: RequestInfo;
    logRequests: boolean;
    protected mockRequestXML: string | null;
    protected mockResponseXML: string | null;
    constructor(stageConfig: ApiConfig, language: Language, xmlConfig?: XML_Config, requestorRef?: string);
    private buildRequestXML;
    updateRequestXML(): void;
    protected fetchOJPResponse(): Promise<RequestInfo>;
    private computeBaseServiceRequestNode;
    protected buildRequestNode(): void;
}
