import * as xmlbuilder from "xmlbuilder";
export class BaseRequestParams {
    constructor() {
        this.serviceRequestNode = this.computeBaseServiceRequestNode();
    }
    computeBaseServiceRequestNode() {
        const ojpNode = xmlbuilder.create("OJP", {
            version: "1.0",
            encoding: "utf-8",
        });
        ojpNode.att("xmlns", "http://www.vdv.de/ojp");
        ojpNode.att("xmlns:siri", "http://www.siri.org.uk/siri");
        ojpNode.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        ojpNode.att("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
        ojpNode.att("xsi:schemaLocation", "http://www.vdv.de/ojp");
        ojpNode.att("version", "2.0");
        const serviceRequestNode = ojpNode
            .ele("OJPRequest")
            .ele("siri:ServiceRequest");
        return serviceRequestNode;
    }
    buildRequestNode() {
        this.serviceRequestNode = this.computeBaseServiceRequestNode();
    }
    buildRequestXML() {
        this.buildRequestNode();
        const bodyXML_s = this.serviceRequestNode.end({
            pretty: true
        });
        return bodyXML_s;
    }
}
