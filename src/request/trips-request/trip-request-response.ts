import * as xmlbuilder from "xmlbuilder";

import { Trip } from "../../trip";

export class TripRequestResponse {
  public trips: Trip[]

  constructor(trips: Trip[]) {
    this.trips = trips
  }

  public asXML(): string {
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
      trip.addToXMLNode(tripResultNode);
    });

    const bodyXML_s = tripDeliveryNode.end({
      pretty: true
    });
    
    return bodyXML_s;
  }
}