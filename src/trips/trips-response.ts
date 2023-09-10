import { Location } from '../location/location'
import { Trip } from '../trip/trip'
import { XPathOJP } from '../helpers/xpath-ojp'
import { IndividualTransportMode } from '../types/individual-mode.types'
import { TripModeType } from '../types/trip-mode-type'
import { TripContinousLeg } from '../trip/leg/trip-continous-leg'
import { PtSituationElement } from '../situation/situation-element'

export class TripsResponse {
  public hasValidResponse: boolean
  public responseXMLText: string
  public contextLocations: Location[]
  public trips: Trip[]

  constructor(hasValidResponse: boolean, responseXMLText: string, contextLocations: Location[], trips: Trip[]) {
    this.hasValidResponse = hasValidResponse
    this.responseXMLText = responseXMLText
    this.contextLocations = contextLocations
    this.trips = trips
  }

  public static initWithXML(responseXMLText: string, tripModeType: TripModeType, transportMode: IndividualTransportMode): TripsResponse {
    const responseXML = new DOMParser().parseFromString(responseXMLText, 'application/xml');

    const statusText = XPathOJP.queryText('//siri:OJPResponse/siri:ServiceDelivery/siri:Status', responseXML)
    const serviceStatus = statusText === 'true'

    const contextLocations = TripsResponse.parseContextLocations(responseXML);
    const contextSituations = TripsResponse.parseContextSituations(responseXML);
    const trips = TripsResponse.parseTrips(responseXML, contextLocations, contextSituations, tripModeType, transportMode);

    const tripResponse = new TripsResponse(serviceStatus, responseXMLText, contextLocations, trips)

    return tripResponse
  }

  private static parseContextLocations(responseXML: Document): Location[] {
    let locations: Location[] = [];

    const locationNodes = XPathOJP.queryNodes('//ojp:TripResponseContext/ojp:Places/ojp:Location', responseXML);
    locationNodes.forEach(locationNode => {
      const location = Location.initWithOJPContextNode(locationNode)
      locations.push(location);
    });

    return locations;
  }

  private static parseContextSituations(responseXML: Document): PtSituationElement[] {
    let situations: PtSituationElement[] = [];

    const nodes = XPathOJP.queryNodes('//ojp:TripResponseContext/ojp:Situations/ojp:PtSituation', responseXML);
    nodes.forEach(node => {
      const situation = PtSituationElement.initFromSituationNode(node);
      if (situation) {
        situations.push(situation);
      }
    });

    return situations;
  }

  private static parseTrips(
    responseXML: Document, 
    contextLocations: Location[],
    contextSituations: PtSituationElement[],
    tripModeType: TripModeType, 
    transportMode: IndividualTransportMode
  ): Trip[] {
    const trips: Trip[] = [];

    const mapContextLocations: Record<string, Location> = {}
    contextLocations.forEach(location => {
      const stopPlaceRef = location.stopPlace?.stopPlaceRef
      if (stopPlaceRef) {
        mapContextLocations[stopPlaceRef] = location
      }
    });

    const mapContextSituations: Record<string, PtSituationElement> = {}
    contextSituations.forEach(situation => {
      mapContextSituations[situation.situationNumber] = situation
    });

    const tripResultNodes = XPathOJP.queryNodes('//ojp:TripResult', responseXML);
    tripResultNodes.forEach(tripResult => {
      const trip = Trip.initFromTripResultNode(tripResult);
      if (trip) {
        trip.legs.forEach(leg => {
          leg.patchLocations(mapContextLocations);
          leg.patchSituations(mapContextSituations);
        })
        trips.push(trip);
      }
    });

    TripsResponse.sortTrips(trips, tripModeType, transportMode)

    return trips
  }

  private static sortTrips(trips: Trip[], tripModeType: TripModeType, transportMode: IndividualTransportMode) {
    if (tripModeType !== 'monomodal') {
      return;
    }

    // Push first the monomodal trip with one leg matching the transport mode
    const monomodalTrip = trips.find(trip => {
      if (trip.legs.length !== 1) {
        return false;
      }

      if (trip.legs[0].legType !== 'ContinousLeg') {
        return false;
      }

      const continousLeg = trip.legs[0] as TripContinousLeg;
      return continousLeg.legTransportMode === transportMode;
    }) ?? null;

    if (monomodalTrip) {
      const tripIdx = trips.indexOf(monomodalTrip);
      trips.splice(tripIdx, 1);
      trips.unshift(monomodalTrip);
    }
  }
}
