import * as xmlbuilder from "xmlbuilder";
export declare class BaseRequestParams {
    protected serviceRequestNode: xmlbuilder.XMLElement;
    constructor();
    private computeBaseServiceRequestNode;
    protected buildRequestNode(): void;
    buildRequestXML(): string;
}
