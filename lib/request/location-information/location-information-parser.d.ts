import { XML_Config } from "../../types/_all";
import { BaseParser } from "../base-parser";
import { LIR_Callback as ParserCallback } from "../types/location-information-request.type";
export declare class LocationInformationParser extends BaseParser {
    private locations;
    callback: ParserCallback | null;
    constructor(xmlConfig: XML_Config);
    parseXML(responseXMLText: string): void;
    protected onCloseTag(nodeName: string): void;
    protected onError(saxError: any): void;
    protected onEnd(): void;
}
