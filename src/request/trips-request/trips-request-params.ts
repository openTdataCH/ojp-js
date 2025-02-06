import * as xmlbuilder from "xmlbuilder";

import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { JourneyPointType } from '../../types/journey-points';
import { Location } from "../../location/location";
import { TripRequestBoardingType } from './trips-request'
import { Language } from "../../types/language-type";
import { ModeOfTransportType } from "../../types/mode-of-transport.type";

export class TripsRequestParams extends BaseRequestParams {
  public fromTripLocation: TripLocationPoint;
  public toTripLocation: TripLocationPoint;
  public departureDate: Date;
  public tripRequestBoardingType: TripRequestBoardingType
  public numberOfResults: number | null
  public publicTransportModes: ModeOfTransportType[]
  
  public modeType: TripModeType;
  public transportMode: IndividualTransportMode;
  public includeLegProjection: boolean;

  public viaLocations: TripLocationPoint[]

  public numberOfResultsAfter: number | null
  public numberOfResultsBefore: number | null

  constructor(
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
    super(language);

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
  }

  public static Empty(): TripsRequestParams {
    const emptyTripLocationPoint = TripLocationPoint.Empty();
    const requestParams = new TripsRequestParams(
      'en',
      emptyTripLocationPoint,
      emptyTripLocationPoint,
      new Date(),
      'Dep',
    );
    return requestParams;
  }

  public static initWithLocationsAndDate(
    language: Language,
    fromLocation: Location | null, 
    toLocation: Location | null,
    departureDate: Date = new Date(),
    tripRequestBoardingType: TripRequestBoardingType = 'Dep',
    includeLegProjection: boolean = false,
    modeType: TripModeType = 'monomodal',
    transportMode: IndividualTransportMode  = 'public_transport',
    viaTripLocations: TripLocationPoint[] = [],
    numberOfResults: number | null = null,
    numberOfResultsBefore: number | null = null,
    numberOfResultsAfter: number | null = null,
    publicTransportModes: ModeOfTransportType[] = [],
  ): TripsRequestParams | null {
    if (fromLocation === null || toLocation === null) {
      return null;
    }

    const fromTripLocationPoint = new TripLocationPoint(fromLocation);
    const toTripLocationPoint = new TripLocationPoint(toLocation);

    const requestParams = TripsRequestParams.initWithTripLocationsAndDate(
      language,
      fromTripLocationPoint, 
      toTripLocationPoint, 
      departureDate, 
      tripRequestBoardingType,
      includeLegProjection,
      modeType,
      transportMode,
      viaTripLocations,
      numberOfResults,
      numberOfResultsBefore,
      numberOfResultsAfter,
      publicTransportModes,
    );
    return requestParams;
  }

  public static initWithTripLocationsAndDate(
    language: Language,
    fromTripLocationPoint: TripLocationPoint | null,
    toTripLocationPoint: TripLocationPoint | null,
    departureDate: Date = new Date(),
    tripRequestBoardingType: TripRequestBoardingType = 'Dep',
    includeLegProjection: boolean = false,
    modeType: TripModeType = 'monomodal',
    transportMode: IndividualTransportMode  = 'public_transport',
    viaTripLocations: TripLocationPoint[] = [],
    numberOfResults: number | null = null,
    numberOfResultsBefore: number | null = null,
    numberOfResultsAfter: number | null = null,
    publicTransportModes: ModeOfTransportType[] = [],
  ): TripsRequestParams | null {
    if (fromTripLocationPoint === null || toTripLocationPoint === null) {
      return null;
    }

    // Both locations should have a geoPosition OR stopPlace
    if (
      !(
        (fromTripLocationPoint.location.geoPosition ||
          fromTripLocationPoint.location.stopPlace) &&
        (toTripLocationPoint.location.geoPosition ||
          toTripLocationPoint.location.stopPlace)
      )
    ) {
      return null;
    }

    const tripRequestParams = new TripsRequestParams(
      language,
      fromTripLocationPoint,
      toTripLocationPoint,
      departureDate,
      tripRequestBoardingType,
      numberOfResults,
      numberOfResultsBefore,
      numberOfResultsAfter,
      publicTransportModes,
    );

    tripRequestParams.includeLegProjection = includeLegProjection;
    tripRequestParams.modeType = modeType;
    tripRequestParams.transportMode = transportMode;
    tripRequestParams.viaLocations = viaTripLocations;

    return tripRequestParams;
  }

  protected buildRequestNode(): void {
    super.buildRequestNode();

    const now = new Date();
    const dateF = now.toISOString();
    this.serviceRequestNode.ele("RequestTimestamp", dateF);

    this.serviceRequestNode.ele("RequestorRef", BaseRequestParams.buildRequestorRef());

    const tripRequestNode = this.serviceRequestNode.ele("ojp:OJPTripRequest");
    tripRequestNode.ele("RequestTimestamp", dateF);

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

      let tagName = isFrom ? "ojp:Origin" : "ojp:Destination";

      const endPointNode = tripRequestNode.ele(tagName);
      const placeRefNode = endPointNode.ele("ojp:PlaceRef");

      if (location.stopPlace?.stopPlaceRef) {
        const locationName = location.locationName ?? "n/a";

        let stopPlaceRef = location.stopPlace?.stopPlaceRef ?? "";

        placeRefNode.ele("ojp:StopPlaceRef", stopPlaceRef);
        placeRefNode.ele("ojp:LocationName").ele("ojp:Text", locationName);
      } else {
        if (location.geoPosition) {
          const geoPositionNode = placeRefNode.ele("ojp:GeoPosition");
          geoPositionNode.ele("Longitude", location.geoPosition.longitude);
          geoPositionNode.ele("Latitude", location.geoPosition.latitude);

          const locationName = location.geoPosition.asLatLngString();
          placeRefNode.ele("ojp:LocationName").ele("ojp:Text", locationName);
        }
      }

      const dateF = this.departureDate.toISOString();
      if (isFrom) {
        if (this.tripRequestBoardingType === 'Dep') {
          endPointNode.ele("ojp:DepArrTime", dateF);
        }
      } else {
        if (this.tripRequestBoardingType === 'Arr') {
          endPointNode.ele("ojp:DepArrTime", dateF);
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

            const itNode = endPointNode.ele('ojp:IndividualTransportOptions');
            this.addAdditionalRestrictions(itNode, tripLocation);
          })();
        }
      }
    });

    this.viaLocations.forEach(viaLocation => {
      const viaNode = tripRequestNode.ele('ojp:Via');
      const viaPointNode = viaNode.ele('ojp:ViaPoint');
      const stopPlace = viaLocation.location.stopPlace;
      if (stopPlace === null) {
        const geoPosition = viaLocation.location.geoPosition;
        if (geoPosition !== null) {
          const geoPositionNode = viaPointNode.ele('ojp:GeoPosition');
          geoPositionNode.ele('Longitude', geoPosition.longitude);
          geoPositionNode.ele('Latitude', geoPosition.latitude);

          viaPointNode.ele('ojp:Name').ele('ojp:Text', viaLocation.location.computeLocationName() ?? 'n/a');
        }
      } else {
        viaPointNode.ele('ojp:StopPlaceRef', stopPlace.stopPlaceRef);
        viaPointNode.ele('ojp:LocationName').ele('ojp:Text', stopPlace.stopPlaceName ?? (viaLocation.location.computeLocationName() ?? 'n/a'));
      }

      if (viaLocation.dwellTimeMinutes !== null) {
        viaNode.ele('ojp:DwellTime', 'PT' + viaLocation.dwellTimeMinutes.toString() + 'M');
      }
    });

    const paramsNode = tripRequestNode.ele("Params");
    
    if (this.transportMode === 'public_transport' && (this.publicTransportModes.length > 0)) {
      // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Params
      const modeContainerNode = paramsNode.ele('PtModeFilter');
      modeContainerNode.ele('ojp:Exclude', 'false');
      this.publicTransportModes.forEach(publicTransportMode => {
        modeContainerNode.ele('ojp:PtMode', publicTransportMode);
      });
    }

    paramsNode.ele('ojp:PrivateModeFilter').ele('ojp:Exclude', 'false');

    if (this.numberOfResults !== null) {
      paramsNode.ele('ojp:NumberOfResults', this.numberOfResults);
    }
    if (this.numberOfResultsBefore !== null) {
      paramsNode.ele('ojp:NumberOfResultsBefore', this.numberOfResultsBefore);
    }
    if (this.numberOfResultsAfter !== null) {
      paramsNode.ele('ojp:NumberOfResultsAfter', this.numberOfResultsAfter);
    }

    paramsNode.ele("ojp:IncludeTrackSections", true);
    paramsNode.ele("ojp:IncludeLegProjection", this.includeLegProjection);
    paramsNode.ele("ojp:IncludeTurnDescription", true);

    const isPublicTransport = this.transportMode === 'public_transport';
    if (isPublicTransport) {
      paramsNode.ele("ojp:IncludeIntermediateStops", true);
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
        paramsNode.ele("ojp:ItModesToCover", transportMode);
      }

      // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Parameters_for_Configuration_of_the_TripRequest
      // - monomodal 
      // - sharing transport modes 
      // => Params/Extension/ItModesToCover=transportMode
      if (isSharingMode) {
        const paramsExtensionNode = paramsNode.ele("ojp:Extension");
        paramsExtensionNode.ele("ojp:ItModesToCover", transportMode);
      }
    } else {
      // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Parameters_for_Configuration_of_the_TripRequest
      // - non-monomodal 
      // - sharing transport modes 
      // => Params/Extension/Origin/Mode=transportMode

      if (isSharingMode) {
        const paramsExtensionNode = paramsNode.ele("ojp:Extension");

        tripEndpoints.forEach((tripEndpoint) => {
          const isFrom = tripEndpoint === "From";
          if (isFrom && this.modeType === "mode_at_end") {
            return;
          }
          if (!isFrom && this.modeType === "mode_at_start") {
            return;
          }

          const tripLocation = isFrom ? this.fromTripLocation : this.toTripLocation;
          const tagName = isFrom ? 'ojp:Origin' : 'ojp:Destination';
          const endPointNode = paramsExtensionNode.ele(tagName);

          this.addAdditionalRestrictions(endPointNode, tripLocation);
        });
      }
    }

    paramsNode.ele("ojp:UseRealtimeData", 'explanatory');
  }
  
  private addAdditionalRestrictions(nodeEl: xmlbuilder.XMLElement, tripLocation: TripLocationPoint) {
    const hasAdditionalRestrictions = (tripLocation.minDuration !== null) || (tripLocation.maxDuration !== null) || (tripLocation.minDistance !== null) || (tripLocation.maxDistance !== null);
    if (!hasAdditionalRestrictions) {
      return;
    }

    if (tripLocation.customTransportMode) {
      nodeEl.ele('ojp:Mode', tripLocation.customTransportMode);
    }
    if (tripLocation.minDuration !== null) {
      nodeEl.ele('ojp:MinDuration', 'PT' + tripLocation.minDuration + 'M');
    }
    if (tripLocation.maxDuration !== null) {
      nodeEl.ele('ojp:MaxDuration', 'PT' + tripLocation.maxDuration + 'M');
    }
    if (tripLocation.minDistance !== null) {
      nodeEl.ele('ojp:MinDistance', tripLocation.minDistance);
    }
    if (tripLocation.maxDistance !== null) {
      nodeEl.ele('ojp:MaxDistance', tripLocation.maxDistance);
    }
  }
}
