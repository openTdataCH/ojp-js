// TODO - 17.04.2025
// Not sure what we need this for?
import * as xmlbuilder from "xmlbuilder";
// This is different than `TripRequest_Response` 
//    because of the XML serialisation which is done here
export class TripRequestResponse {
    constructor(trips) {
        this.trips = trips;
    }
    asXML() {
        const ojpV1_XML_Config = {
            ojpVersion: '1.0',
            defaultNS: 'siri',
            mapNS: {
                'ojp': 'http://www.vdv.de/ojp',
                'siri': 'http://www.siri.org.uk/siri',
            },
        };
        const rootNode = xmlbuilder.create("siri:OJP", {
            version: "1.0",
            encoding: "utf-8",
        });
        rootNode.att("xmlns:ojp", "http://www.vdv.de/ojp");
        rootNode.att("xmlns:siri", "http://www.siri.org.uk/siri");
        rootNode.att("version", "1.0");
        const tripDeliveryNode = rootNode
            .ele("siri:OJPResponse")
            .ele("siri:ServiceDelivery")
            .ele("ojp:OJPTripDelivery");
        this.trips.forEach(trip => {
            const tripResultNode = tripDeliveryNode.ele('ojp:TripResult');
            tripResultNode.ele('ojp:ResultId', trip.id);
            debugger;
            const tripNode = trip.asXMLNode(ojpV1_XML_Config);
            // tripResultNode.ele(tripNode);
            // trip.addToXMLNode(tripResultNode, ojpV1_XML_Config);
        });
        const bodyXML_s = tripDeliveryNode.end({
            pretty: true
        });
        return bodyXML_s;
    }
}
