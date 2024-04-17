import * as xmlbuilder from "xmlbuilder";
export declare class BaseRequestParams {
    protected serviceRequestNode: xmlbuilder.XMLElement;
    constructor();
    private computeBaseServiceRequestNode;
    protected buildRequestorRef(): string;
    protected buildRequestNode(): void;
    buildRequestXML(): string;
}
