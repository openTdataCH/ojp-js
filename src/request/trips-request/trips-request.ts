import * as xmlbuilder from "xmlbuilder";

import { OJPBaseRequest } from '../base-request';
import { EMPTY_API_CONFIG, ApiConfig } from '../../types/stage-config';
import { TripRequest_Response, TripRequest_Callback } from '../types/trip-request.type';
import { TripRequestParser } from './trip-request-parser';
import { TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';
import { Language } from '../../types/language-type';

import { TripModeType } from '../../types/trip-mode-type';
import { IndividualTransportMode } from '../../types/individual-mode.types';
import { ModeOfTransportType } from '../../types/mode-of-transport.type';
import { JourneyPointType } from '../../types/journey-points';
import { OJP_Helpers } from "../../helpers/ojp-helpers";
import { OJP_VERSION } from "../../constants";

export type TripRequestBoardingType = 'Dep' | 'Arr'

export class TripRequest extends OJPBaseRequest {
  public fromTripLocation: TripLocationPoint;
  public toTripLocation: TripLocationPoint;
  public departureDate: Date;
  public tripRequestBoardingType: TripRequestBoardingType;
  
  public numberOfResults: number | null;
  public numberOfResultsAfter: number | null;
  public numberOfResultsBefore: number | null;
  
  public publicTransportModes: ModeOfTransportType[];
  
  public modeType: TripModeType;
  public transportMode: IndividualTransportMode;
  public includeLegProjection: boolean;

  public viaLocations: TripLocationPoint[];

  public response: TripRequest_Response | null;

  public enableExtensions: boolean;

  constructor(
    stageConfig: ApiConfig, 
    language: Language,
    fromTripLocation: TripLocationPoint,
    toTripLocation: TripLocationPoint,
    departureDate: Date = new Date(),
    tripRequestBoardingType: TripRequestBoardingType = 'Dep',
    numberOfResults: number | null = null,
    numberOfResultsBefore: number | null = null,
    numberOfResultsAfter: number | null = null,
    publicTransportModes: ModeOfTransportType[] = [],
  ) {
    super(stageConfig, language);

    this.fromTripLocation = fromTripLocation;
    this.toTripLocation = toTripLocation;
    this.departureDate = departureDate;
    this.tripRequestBoardingType = tripRequestBoardingType;

    this.numberOfResults = numberOfResults;
    this.numberOfResultsBefore = numberOfResultsBefore;
    this.numberOfResultsAfter = numberOfResultsAfter;

    this.publicTransportModes = publicTransportModes;

    this.modeType = "monomodal";
    this.transportMode = "public_transport";
    this.includeLegProjection = true;

    this.viaLocations = [];

    this.enableExtensions = true;

    this.response = null;
  }

  private static Empty(): TripRequest {
    const emptyTripLocationPoint = TripLocationPoint.Empty();
    const request = new TripRequest(EMPTY_API_CONFIG, 'en', emptyTripLocationPoint, emptyTripLocationPoint, new Date(), 'Dep');

    return request;
  }

  public static initWithResponseMock(mockText: string) {
    const request = TripRequest.Empty();
    request.mockResponseXML = mockText;
    
    return request;
  }

  public static initWithRequestMock(mockText: string, stageConfig: ApiConfig = EMPTY_API_CONFIG) {
    const request = TripRequest.Empty();
    request.mockRequestXML = mockText;
    request.requestInfo.requestXML = mockText;
    
    return request;
  }

  public static initWithStopRefs(stageConfig: ApiConfig, language: Language, fromStopRef: string, toStopRef: string, departureDate: Date = new Date(), tripRequestBoardingType: TripRequestBoardingType = 'Dep') {
    const fromLocation = Location.initWithStopPlaceRef(fromStopRef);
    const toLocation = Location.initWithStopPlaceRef(toStopRef);
    const fromTripLocationPoint = new TripLocationPoint(fromLocation);
    const toTripLocationPoint = new TripLocationPoint(toLocation);

    const request = new TripRequest(stageConfig, language, fromTripLocationPoint, toTripLocationPoint, departureDate, tripRequestBoardingType);
    
    return request;
  }

  public static initWithLocationsAndDate(stageConfig: ApiConfig, language: Language, fromLocation: Location, toLocation: Location, departureDate: Date, tripRequestBoardingType: TripRequestBoardingType = 'Dep') {
    const fromTripLocationPoint = new TripLocationPoint(fromLocation);
    const toTripLocationPoint = new TripLocationPoint(toLocation);
    
    const request = new TripRequest(stageConfig, language, fromTripLocationPoint, toTripLocationPoint, departureDate, tripRequestBoardingType);

    return request;
  }

  public static initWithTripLocationsAndDate(
    stageConfig: ApiConfig, 
    language: Language, 
    fromTripLocation: TripLocationPoint | null, 
    toTripLocation: TripLocationPoint | null, 
    departureDate: Date, 
    tripRequestBoardingType: TripRequestBoardingType = 'Dep', 
    includeLegProjection: boolean = false,
    modeType: TripModeType = 'monomodal',
    transportMode: IndividualTransportMode  = 'public_transport',
    viaTripLocations: TripLocationPoint[] = [],
    numberOfResults: number | null = null,
    numberOfResultsBefore: number | null = null,
    numberOfResultsAfter: number | null = null,
    publicTransportModes: ModeOfTransportType[] = [],
  ) {
    if ((fromTripLocation === null) || (toTripLocation === null)) {
      return null;
    }

    if (
      !(
        (fromTripLocation.location.geoPosition ||
          fromTripLocation.location.stopPlace) &&
        (toTripLocation.location.geoPosition ||
          toTripLocation.location.stopPlace)
      )
    ) {
      return null;
    }

    const request = new TripRequest(
      stageConfig,
      language, 
      fromTripLocation, 
      toTripLocation, 
      departureDate, 
      tripRequestBoardingType,

      numberOfResults,
      numberOfResultsBefore,
      numberOfResultsAfter,

      publicTransportModes,
    );
    request.includeLegProjection = includeLegProjection;
    request.modeType = modeType;
    request.transportMode = transportMode;
    request.viaLocations = viaTripLocations;

    return request;
  }

  protected buildRequestNode(): void {
    super.buildRequestNode();

    const now = new Date();
    const dateF = now.toISOString();
    this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);

    this.serviceRequestNode.ele("siri:RequestorRef", OJP_Helpers.buildRequestorRef());

    const tripRequestNode = this.serviceRequestNode.ele("OJPTripRequest");
    tripRequestNode.ele("siri:RequestTimestamp", dateF);

    const modeType = this.modeType;
    const isMonomodal = modeType === "monomodal";

    const transportMode = this.transportMode;

    const tripEndpoints: JourneyPointType[] = ["From", "To"];
    tripEndpoints.forEach((tripEndpoint) => {
      const isFrom = tripEndpoint === "From";
      const tripLocation = isFrom
        ? this.fromTripLocation
        : this.toTripLocation;
      const location = tripLocation.location;

      let tagName = isFrom ? "Origin" : "Destination";

      const endPointNode = tripRequestNode.ele(tagName);
      const placeRefNode = endPointNode.ele("PlaceRef");

      if (location.stopPlace?.stopPlaceRef) {
        const locationName = location.locationName ?? "n/a";

        let stopPlaceRef = location.stopPlace?.stopPlaceRef ?? "";

        placeRefNode.ele("StopPlaceRef", stopPlaceRef);
        placeRefNode.ele("Name").ele("Text", locationName);
      } else {
        if (location.geoPosition) {
          const geoPositionNode = placeRefNode.ele("GeoPosition");
          geoPositionNode.ele("siri:Longitude", location.geoPosition.longitude);
          geoPositionNode.ele("siri:Latitude", location.geoPosition.latitude);

          const locationName = location.geoPosition.asLatLngString();
          placeRefNode.ele("Name").ele("Text", locationName);
        }
      }

      const dateF = this.departureDate.toISOString();
      if (isFrom) {
        if (this.tripRequestBoardingType === 'Dep') {
          endPointNode.ele("DepArrTime", dateF);
        }
      } else {
        if (this.tripRequestBoardingType === 'Arr') {
          endPointNode.ele("DepArrTime", dateF);
        }
      }

      if (!isMonomodal) {
        // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Parameters_for_Configuration_of_the_TripRequest
        // non-monomodal cycle transport modes is rendered in Origin/Destination
        const isCycle = transportMode === 'cycle';
        if (isCycle) {
          (() => {
            if (modeType === 'mode_at_start' && !isFrom) {
              return;
            }

            if (modeType === 'mode_at_end' && isFrom) {
              return;
            }

            const itNode = endPointNode.ele('IndividualTransportOptions');
            this.addAdditionalRestrictions(itNode, tripLocation);
          })();
        }
      }
    });

    this.viaLocations.forEach(viaLocation => {
      const viaNode = tripRequestNode.ele('Via');
      const viaPointNode = viaNode.ele('ViaPoint');
      const stopPlace = viaLocation.location.stopPlace;
      if (stopPlace === null) {
        const geoPosition = viaLocation.location.geoPosition;
        if (geoPosition !== null) {
          const geoPositionNode = viaPointNode.ele('GeoPosition');
          geoPositionNode.ele('siri:Longitude', geoPosition.longitude);
          geoPositionNode.ele('siri:Latitude', geoPosition.latitude);

          viaPointNode.ele('Name').ele('Text', viaLocation.location.computeLocationName() ?? 'n/a');
        }
      } else {
        viaPointNode.ele('StopPlaceRef', stopPlace.stopPlaceRef);
        viaPointNode.ele('Name').ele('Text', stopPlace.stopPlaceName ?? (viaLocation.location.computeLocationName() ?? 'n/a'));
      }

      if (viaLocation.dwellTimeMinutes !== null) {
        viaNode.ele('DwellTime', 'PT' + viaLocation.dwellTimeMinutes.toString() + 'M');
      }
    });

    const paramsNode = tripRequestNode.ele("Params");
    
    if (this.transportMode === 'public_transport' && (this.publicTransportModes.length > 0)) {
      const modeContainerNode = paramsNode.ele('ModeAndModeOfOperationFilter');
      modeContainerNode.ele('Exclude', 'false');
      this.publicTransportModes.forEach(publicTransportMode => {
        modeContainerNode.ele('PtMode', publicTransportMode);
      });
    }

    if (this.enableExtensions) {
      paramsNode.ele('IncludeAllRestrictedLines', 'true');
    }

    if (this.numberOfResults !== null) {
      paramsNode.ele('NumberOfResults', this.numberOfResults);
    }
    if (this.numberOfResultsBefore !== null) {
      paramsNode.ele('NumberOfResultsBefore', this.numberOfResultsBefore);
    }
    if (this.numberOfResultsAfter !== null) {
      paramsNode.ele('NumberOfResultsAfter', this.numberOfResultsAfter);
    }

    paramsNode.ele("IncludeTrackSections", true);
    paramsNode.ele("IncludeLegProjection", this.includeLegProjection);
    paramsNode.ele("IncludeTurnDescription", true);

    const isPublicTransport = this.transportMode === 'public_transport';
    if (isPublicTransport) {
      paramsNode.ele("IncludeIntermediateStops", true);
    }

    const sharingModes: IndividualTransportMode[] = [
      "bicycle_rental",
      "car_sharing",
      "escooter_rental",
    ];
    const isSharingMode = sharingModes.indexOf(transportMode) !== -1;

    if (isMonomodal) {
      const standardModes: IndividualTransportMode[] = [
        "foot",
        "walk",
        "self-drive-car",
        "cycle",
        "taxi",
        "others-drive-car",
      ];
      if (standardModes.indexOf(transportMode) !== -1) {
        paramsNode.ele("ItModeToCover").ele('PersonalMode', transportMode);
      }

      if (OJP_VERSION === '2.0') {
        const carTransportModes: IndividualTransportMode[] = ['car', 'car-ferry', 'car-shuttle-train', 'car_sharing', 'self-drive-car', 'others-drive-car'];
        if (carTransportModes.includes(transportMode)) {
          const modeAndModeEl = paramsNode.ele('ModeAndModeOfOperationFilter');
          
          modeAndModeEl.ele('siri:WaterSubmode', 'localCarFerry');
          modeAndModeEl.ele('siri:RailSubmode', 'vehicleTunnelTransportRailService');
        }  
      }

      // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Parameters_for_Configuration_of_the_TripRequest
      // - monomodal 
      // - sharing transport modes 
      // => Params/Extension/ItModesToCover=transportMode
      if (isSharingMode) {
        const paramsExtensionNode = paramsNode.ele("Extension");
        paramsExtensionNode.ele("ItModesToCover", transportMode);
      }
    } else {
      // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Parameters_for_Configuration_of_the_TripRequest
      // - non-monomodal 
      // - sharing transport modes 
      // => Params/Extension/Origin/Mode=transportMode

      if (isSharingMode) {
        const paramsExtensionNode = paramsNode.ele("Extension");

        tripEndpoints.forEach((tripEndpoint) => {
          const isFrom = tripEndpoint === "From";
          if (isFrom && this.modeType === "mode_at_end") {
            return;
          }
          if (!isFrom && this.modeType === "mode_at_start") {
            return;
          }

          const tripLocation = isFrom ? this.fromTripLocation : this.toTripLocation;
          const tagName = isFrom ? 'Origin' : 'Destination';
          const endPointNode = paramsExtensionNode.ele(tagName);

          this.addAdditionalRestrictions(endPointNode, tripLocation);
        });
      }
    }

    paramsNode.ele("UseRealtimeData", 'explanatory');
  }
  
  private addAdditionalRestrictions(nodeEl: xmlbuilder.XMLElement, tripLocation: TripLocationPoint) {
    const hasAdditionalRestrictions = (tripLocation.minDuration !== null) || (tripLocation.maxDuration !== null) || (tripLocation.minDistance !== null) || (tripLocation.maxDistance !== null);
    if (!hasAdditionalRestrictions) {
      return;
    }

    if (tripLocation.customTransportMode) {
      nodeEl.ele('ItModeAndModeOfOperation').ele('PersonalMode', tripLocation.customTransportMode);
    }
    if (tripLocation.minDuration !== null) {
      nodeEl.ele('MinDuration', 'PT' + tripLocation.minDuration + 'M');
    }
    if (tripLocation.maxDuration !== null) {
      nodeEl.ele('MaxDuration', 'PT' + tripLocation.maxDuration + 'M');
    }
    if (tripLocation.minDistance !== null) {
      nodeEl.ele('MinDistance', tripLocation.minDistance);
    }
    if (tripLocation.maxDistance !== null) {
      nodeEl.ele('MaxDistance', tripLocation.maxDistance);
    }
  }

  public async fetchResponse(): Promise<TripRequest_Response> {
    await this.fetchOJPResponse();

    const promise = new Promise<TripRequest_Response>((resolve) => {
      this.parseTripRequestResponse(resolve);
    });

    return promise;
  }

  public fetchResponseWithCallback(callback: TripRequest_Callback) {
    this.fetchOJPResponse().then((requestInfo) => {
      this.requestInfo = requestInfo;
      this.parseTripRequestResponse(callback);
    });
  }

  private parseTripRequestResponse(callback: TripRequest_Callback) {
    this.response = null;

    if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
      const errorResponse: TripRequest_Response = {
        tripsNo: 0,
        trips: [],
        message: null
      }

      errorResponse.message = 'ERROR';
      callback(errorResponse);
      return;
    }

    const parser = new TripRequestParser();
    parser.callback = (parserResponse) => {
      if (parserResponse.message === 'TripRequest.Trip' && parserResponse.trips.length === 1) {
        this.requestInfo.parseDateTime = new Date();
      }

      this.response = parserResponse;

      callback(parserResponse);
    };
    parser.parseXML(this.requestInfo.responseXML);
  }
}
