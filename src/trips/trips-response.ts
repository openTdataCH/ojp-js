import * as sax from 'sax';

import { Location } from '../location/location'
import { Trip } from '../trip/trip'
import { TripContinousLeg } from '../trip/leg/trip-continous-leg'
import { PtSituationElement } from '../situation/situation-element'
import { TreeNode } from '../xml/tree-node';
import { TripRequestEvent, TripsRequestParams } from '../request';

export class TripsResponse {
  public hasValidResponse: boolean
  public trips: Trip[]
  public parserTripsNo: number
  public tripRequestParams: TripsRequestParams | null

  constructor() {
    this.hasValidResponse = false;
    this.trips = [];
    this.parserTripsNo = 0;
    this.tripRequestParams = null;
  }

  public parseXML(responseXMLText: string, callback: (message: TripRequestEvent, isComplete: boolean) => void) {
    const saxStream = sax.createStream(true, { trim: true });
    const rootNode = new TreeNode('root', null, {}, [], null);

    let currentNode: TreeNode = rootNode;
    const stack: TreeNode[] = [rootNode];
    let mapContextLocations: Record<string, Location> = {};
    let mapContextSituations: Record<string, PtSituationElement> = {};

    this.hasValidResponse = false;
    this.trips = [];
    this.parserTripsNo = 0;

    const tripsNo = responseXMLText.split('<ojp:Trip>').length - 1;
    this.parserTripsNo = tripsNo;
    callback('TripRequest.TripsNo', false);

    saxStream.on('opentag', (node) => {
      const newNode = new TreeNode(node.name, currentNode.name, node.attributes as Record<string, string>, [], null);

      currentNode.children.push(newNode);
      stack.push(newNode);
      currentNode = newNode;
    });

    saxStream.on('closetag', (nodeName) => {
      stack.pop();

      if (nodeName === 'ojp:Trip') {
        const trip = Trip.initFromTreeNode(currentNode);
        if (trip) {
          trip.legs.forEach(leg => {
            leg.patchLocations(mapContextLocations);
            leg.patchSituations(mapContextSituations);
          });

          this.trips.push(trip);

          callback('TripRequest.Trip', false);
        }
      }

      if (nodeName === 'ojp:TripResponseContext') {
        const placesTreeNode = currentNode.findChildNamed('ojp:Places');
        if (placesTreeNode) {
          mapContextLocations = {};
              
          const locationTreeNodes = placesTreeNode.findChildrenNamed('ojp:Location');
          locationTreeNodes.forEach(locationTreeNode => {
            const location = Location.initWithTreeNode(locationTreeNode);
            const stopPlaceRef = location.stopPlace?.stopPlaceRef ?? null;
            if (stopPlaceRef !== null) {
              mapContextLocations[stopPlaceRef] = location;
            }
          });
        }

        const situationsTreeNode = currentNode.findChildNamed('ojp:Situations');
        if (situationsTreeNode) {
          mapContextSituations = {};

          const situationTreeNodes = situationsTreeNode.findChildrenNamed('ojp:PtSituation');
          situationTreeNodes.forEach(situationTreeNode => {
            const situation = PtSituationElement.initWithSituationTreeNode(situationTreeNode);
            if (situation) {
              mapContextSituations[situation.situationNumber] = situation;
            }
          });
        }
      }

      currentNode = stack[stack.length - 1];
    });

    saxStream.on('text', (text) => {
      currentNode.text = text;
    });

    saxStream.on('error', (error) => {
      console.error('SAX parsing error:', error);
      debugger;
    });

    saxStream.on('end', () => {
      this.hasValidResponse = true;
      TripsResponse.sortTrips(this.trips, this.tripRequestParams);

      callback('TripRequest.DONE', true);
    });

    saxStream.write(responseXMLText);
    saxStream.end();
  }

  private static sortTrips(trips: Trip[], tripRequestParams: TripsRequestParams | null = null) {
    if (tripRequestParams === null) {
      return;
    }

    const tripModeType = tripRequestParams.modeType;
    const transportMode = tripRequestParams.transportMode;

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
