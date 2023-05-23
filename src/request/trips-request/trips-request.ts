import { JourneyPointType } from '../../types/journey-points';
import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { TripsResponse } from '../../trips/trips-response'
import { Default_APP_Stage, StageConfig } from '../../types/stage-config';
import { RequestErrorData } from './../request-error'
import { IndividualTransportMode } from '../../types/individual-mode.types';

export class TripRequest extends OJPBaseRequest {
  public requestParams: TripsRequestParams

  constructor(stageConfig: StageConfig, requestParams: TripsRequestParams) {
    super(stageConfig);
    this.requestParams = requestParams;
  }

  public fetchResponse(completion: (response: TripsResponse, error: RequestErrorData | null) => void) {
    this.buildTripRequestNode();
    const bodyXML_s = this.serviceRequestNode.end();
    super.fetchOJPResponse(bodyXML_s, (responseText, errorData) => {
      const tripsResponse = TripsResponse.initWithXML(responseText, this.requestParams.modeType, this.requestParams.transportMode);
      if (errorData === null && !tripsResponse.hasValidResponse) {
        errorData = {
          error: 'ParseTripsXMLError',
          message: 'Invalid TripsRequest Response XML'
        }
      }
      completion(tripsResponse, errorData);
    });
  }

  public computeRequestXmlString(): string {
    this.buildTripRequestNode();

    let bodyXML_s = this.serviceRequestNode.end({
      pretty: true
    });

    return bodyXML_s;
  }

  private buildTripRequestNode() {
    const now = new Date()
    const dateF = now.toISOString();
    this.serviceRequestNode.ele('RequestTimestamp', dateF)

    const tripRequestNode = this.serviceRequestNode.ele('ojp:OJPTripRequest');
    tripRequestNode.ele('RequestTimestamp', dateF)

    const modeType = this.requestParams.modeType;
    const isMonomodal = modeType === 'monomodal';

    const transportMode = this.requestParams.transportMode;

    const tripEndpoints: JourneyPointType[] = ["From", "To"]
    tripEndpoints.forEach(tripEndpoint => {
      const isFrom = tripEndpoint === 'From';
      const tripLocation = isFrom ? this.requestParams.fromTripLocation : this.requestParams.toTripLocation;
      const location = tripLocation.location;

      let tagName = isFrom ? 'Origin' : 'Destination';

      const endPointNode = tripRequestNode.ele('ojp:' + tagName);
      const placeRefNode = endPointNode.ele('ojp:PlaceRef');

      if (location.stopPlace?.stopPlaceRef) {
        const locationName = location.locationName ?? 'n/a'
        
        let stopPlaceRef = location.stopPlace?.stopPlaceRef ?? ''

        placeRefNode.ele('StopPointRef', stopPlaceRef);
        placeRefNode.ele('ojp:LocationName').ele('ojp:Text', locationName)
      } else {
        if (location.geoPosition) {
          const geoPositionNode = placeRefNode.ele('ojp:GeoPosition')
          geoPositionNode.ele('Longitude', location.geoPosition.longitude)
          geoPositionNode.ele('Latitude', location.geoPosition.latitude)

          const locationName = location.geoPosition.asLatLngString()
          placeRefNode.ele('ojp:LocationName').ele('ojp:Text', locationName)
        }
      }

      if (isFrom) {
        const dateF = this.requestParams.departureDate.toISOString();
        endPointNode.ele('ojp:DepArrTime', dateF);  
      }

      if (isMonomodal) {
        if (isFrom) {
          // https://github.com/openTdataCH/ojp-demo-app-src/issues/64
          // Allow maxduration for more than 40m for walking / cycle monomodal routes
          const modesWithOptions: IndividualTransportMode[] = ['walk', 'cycle'];
          if (modesWithOptions.indexOf(transportMode) !== -1) {
            const transportModeOptionsNode = endPointNode.ele('ojp:IndividualTransportOptions');
            transportModeOptionsNode.ele('ojp:Mode', transportMode);
            
            if (transportMode === 'walk') {
              transportModeOptionsNode.ele('ojp:MaxDuration', 'PT3000M');
            }
            if (transportMode === 'cycle') {
              transportModeOptionsNode.ele('ojp:MaxDuration', 'PT600M');
            }
          }
        }  
      } else {
        if (transportMode === 'taxi') {
          const hasExtension: boolean = (() => {
            if (isFrom && this.requestParams.modeType === 'mode_at_end') {
              return false;
            }
            
            if (!isFrom && this.requestParams.modeType === 'mode_at_start') {
              return false;
            }
  
            return true;
          })();
          
          if (hasExtension) {
            // TODO - in a method
            const transportModeOptionsNode = endPointNode.ele('ojp:IndividualTransportOptions');
            if (tripLocation.customTransportMode) {
              transportModeOptionsNode.ele('ojp:Mode', tripLocation.customTransportMode)
            }
    
            transportModeOptionsNode.ele('ojp:MinDuration', 'PT' + tripLocation.minDuration + 'M')
            transportModeOptionsNode.ele('ojp:MaxDuration', 'PT' + tripLocation.maxDuration + 'M')
            transportModeOptionsNode.ele('ojp:MinDistance', tripLocation.minDistance)
            transportModeOptionsNode.ele('ojp:MaxDistance', tripLocation.maxDistance)
          }
        }
      }
    });

    const paramsNode = tripRequestNode.ele('ojp:Params');

    const numberOfResults = this.computeNumberOfResultsParam();
    if (numberOfResults !== null) {
      paramsNode.ele('ojp:NumberOfResults', numberOfResults);
    }

    paramsNode.ele('ojp:IncludeTrackSections', true)
    paramsNode.ele('ojp:IncludeLegProjection', this.requestParams.includeLegProjection)
    paramsNode.ele('ojp:IncludeTurnDescription', true)
    paramsNode.ele('ojp:IncludeIntermediateStops', true)

    if (isMonomodal) {
      const standardModes: IndividualTransportMode[] = ['walk', 'self-drive-car', 'cycle', 'taxi'];
      if (standardModes.indexOf(transportMode) !== -1) {
        paramsNode.ele('ojp:ItModesToCover', transportMode);
      }

      const sharingModes: IndividualTransportMode[] = ['bicycle_rental', 'car_sharing', 'escooter_rental'];
      const isExtension = sharingModes.indexOf(transportMode) !== -1;
      if (isExtension) {
        const paramsExtensionNode = paramsNode.ele('ojp:Extension');
        paramsExtensionNode.ele('ojp:ItModesToCover', transportMode);
      }
    } else {
      const hasExtension = transportMode !== 'taxi';
      if (hasExtension) {
        const paramsExtensionNode = paramsNode.ele('ojp:Extension');
      
        tripEndpoints.forEach(tripEndpoint => {
          const isFrom = tripEndpoint === 'From';
          if (isFrom && this.requestParams.modeType === 'mode_at_end') {
            return;
          }
          if (!isFrom && this.requestParams.modeType === 'mode_at_start') {
            return;
          }
          
          const tripLocation = isFrom ? this.requestParams.fromTripLocation : this.requestParams.toTripLocation;
          
          let tagName = isFrom ? 'Origin' : 'Destination';
          const endpointNode = paramsExtensionNode.ele('ojp:' + tagName);
    
          endpointNode.ele('ojp:MinDuration', 'PT' + tripLocation.minDuration + 'M')
          endpointNode.ele('ojp:MaxDuration', 'PT' + tripLocation.maxDuration + 'M')
          endpointNode.ele('ojp:MinDistance', tripLocation.minDistance)
          endpointNode.ele('ojp:MaxDistance', tripLocation.maxDistance)
    
          if (tripLocation.customTransportMode) {
            endpointNode.ele('ojp:Mode', tripLocation.customTransportMode)
          }
        });
      }
    }
  }

  private computeNumberOfResultsParam(): number | null {
    const stageLABeta: Default_APP_Stage = 'LA Beta'
    if (this.stageConfig.key === stageLABeta) {
      return 1;
    }
    
    return 5;
  }
}
