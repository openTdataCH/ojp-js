import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { JourneyPointType } from '../../types/journey-points';
import { Location } from "../../location/location";
import { TripRequestBoardingType } from './trips-request'
import { NumberOfResultsType } from "../types/trip-request.type";
import { Language } from "../../types/language-type";

export class TripsRequestParams extends BaseRequestParams {
  public fromTripLocation: TripLocationPoint;
  public toTripLocation: TripLocationPoint;
  public departureDate: Date;
  public tripRequestBoardingType: TripRequestBoardingType
  public numberOfResultsType: NumberOfResultsType
  
  public modeType: TripModeType;
  public transportMode: IndividualTransportMode;
  public includeLegProjection: boolean;

  public viaLocations: TripLocationPoint[]

  constructor(
    language: Language,
    fromTripLocation: TripLocationPoint,
    toTripLocation: TripLocationPoint,
    departureDate: Date = new Date(),
    tripRequestBoardingType: TripRequestBoardingType = 'Dep',
    numberOfResultsType: NumberOfResultsType = 'NumberOfResults',
  ) {
    super(language);

    this.fromTripLocation = fromTripLocation;
    this.toTripLocation = toTripLocation;
    this.departureDate = departureDate;
    this.tripRequestBoardingType = tripRequestBoardingType;
    this.numberOfResultsType = numberOfResultsType;

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
      'NumberOfResults',
    );
    return requestParams;
  }

  public static initWithLocationsAndDate(
    language: Language,
    fromLocation: Location | null, 
    toLocation: Location | null,
    departureDate: Date = new Date(),
    tripRequestBoardingType: TripRequestBoardingType = 'Dep',
    numberOfResultsType: NumberOfResultsType = 'NumberOfResults',
    includeLegProjection: boolean = false,
    modeType: TripModeType = 'monomodal',
    transportMode: IndividualTransportMode  = 'public_transport',
    viaTripLocations: TripLocationPoint[] = [],
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
      numberOfResultsType,
      includeLegProjection,
      modeType,
      transportMode,
      viaTripLocations,
    );
    return requestParams;
  }

  public static initWithTripLocationsAndDate(
    language: Language,
    fromTripLocationPoint: TripLocationPoint | null,
    toTripLocationPoint: TripLocationPoint | null,
    departureDate: Date = new Date(),
    tripRequestBoardingType: TripRequestBoardingType = 'Dep',
    numberOfResultsType: NumberOfResultsType = 'NumberOfResults',
    includeLegProjection: boolean = false,
    modeType: TripModeType = 'monomodal',
    transportMode: IndividualTransportMode  = 'public_transport',
    viaTripLocations: TripLocationPoint[] = [],
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
      numberOfResultsType,
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
    this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);

    this.serviceRequestNode.ele("siri:RequestorRef", this.buildRequestorRef());

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
        placeRefNode.ele("LocationName").ele("Text", locationName);
      } else {
        if (location.geoPosition) {
          const geoPositionNode = placeRefNode.ele("GeoPosition");
          geoPositionNode.ele("siri:Longitude", location.geoPosition.longitude);
          geoPositionNode.ele("siri:Latitude", location.geoPosition.latitude);

          const locationName = location.geoPosition.asLatLngString();
          placeRefNode.ele("LocationName").ele("Text", locationName);
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

      if (isMonomodal) {
        if (isFrom) {
          // https://github.com/openTdataCH/ojp-demo-app-src/issues/64
          // Allow maxduration for more than 40m for walking / cycle monomodal routes
          const modesWithOptions: IndividualTransportMode[] = ["walk", "cycle"];
          if (modesWithOptions.indexOf(transportMode) !== -1) {
            const transportModeOptionsNode = endPointNode.ele(
              "IndividualTransportOptions"
            );
            transportModeOptionsNode.ele("Mode", transportMode);

            if (transportMode === "walk") {
              transportModeOptionsNode.ele("MaxDuration", "PT3000M");
            }
            if (transportMode === "cycle") {
              transportModeOptionsNode.ele("MaxDuration", "PT600M");
            }
          }
        }
      } else {
        const isOthersDriveCar =
          transportMode === "taxi" || transportMode === "others-drive-car";
        if (isOthersDriveCar) {
          const hasExtension: boolean = (() => {
            if (isFrom && this.modeType === "mode_at_end") {
              return false;
            }

            if (!isFrom && this.modeType === "mode_at_start") {
              return false;
            }

            return true;
          })();

          if (hasExtension) {
            // TODO - in a method
            const transportModeOptionsNode = endPointNode.ele(
              "IndividualTransportOptions"
            );
            if (tripLocation.customTransportMode) {
              transportModeOptionsNode.ele(
                "Mode",
                tripLocation.customTransportMode
              );
            }

            transportModeOptionsNode.ele(
              "MinDuration",
              "PT" + tripLocation.minDuration + "M"
            );
            transportModeOptionsNode.ele(
              "MaxDuration",
              "PT" + tripLocation.maxDuration + "M"
            );
            transportModeOptionsNode.ele(
              "MinDistance",
              tripLocation.minDistance
            );
            transportModeOptionsNode.ele(
              "MaxDistance",
              tripLocation.maxDistance
            );
          }
        }
      }
    });

    this.viaLocations.forEach(viaLocation => {
      const viaPointNode = tripRequestNode.ele('Via').ele('ViaPoint');
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
        viaPointNode.ele('LocationName').ele('Text', stopPlace.stopPlaceName ?? (viaLocation.location.computeLocationName() ?? 'n/a'));
      }
    });

    const paramsNode = tripRequestNode.ele("Params");

    const numberOfResults = 5;
    const nodeName = this.numberOfResultsType;
    paramsNode.ele(nodeName, numberOfResults);

    paramsNode.ele("IncludeTrackSections", true);
    paramsNode.ele(
      "IncludeLegProjection",
      this.includeLegProjection
    );
    paramsNode.ele("IncludeTurnDescription", true);
    paramsNode.ele("IncludeIntermediateStops", true);

    if (isMonomodal) {
      const standardModes: IndividualTransportMode[] = [
        "walk",
        "self-drive-car",
        "cycle",
        "taxi",
        "others-drive-car",
      ];
      if (standardModes.indexOf(transportMode) !== -1) {
        paramsNode.ele("ItModesToCover", transportMode);
      }

      const sharingModes: IndividualTransportMode[] = [
        "bicycle_rental",
        "car_sharing",
        "escooter_rental",
      ];
      const isExtension = sharingModes.indexOf(transportMode) !== -1;
      if (isExtension) {
        const paramsExtensionNode = paramsNode.ele("Extension");
        paramsExtensionNode.ele("ItModesToCover", transportMode);
      }
    } else {
      const isOthersDriveCar =
        transportMode === "taxi" || transportMode === "others-drive-car";
      const hasExtension = !isOthersDriveCar;
      if (hasExtension) {
        const paramsExtensionNode = paramsNode.ele("Extension");

        tripEndpoints.forEach((tripEndpoint) => {
          const isFrom = tripEndpoint === "From";
          if (isFrom && this.modeType === "mode_at_end") {
            return;
          }
          if (!isFrom && this.modeType === "mode_at_start") {
            return;
          }

          const tripLocation = isFrom
            ? this.fromTripLocation
            : this.toTripLocation;

          let tagName = isFrom ? "Origin" : "Destination";
          const endpointNode = paramsExtensionNode.ele(tagName);

          endpointNode.ele(
            "MinDuration",
            "PT" + tripLocation.minDuration + "M"
          );
          endpointNode.ele(
            "MaxDuration",
            "PT" + tripLocation.maxDuration + "M"
          );
          endpointNode.ele("MinDistance", tripLocation.minDistance);
          endpointNode.ele("MaxDistance", tripLocation.maxDistance);

          if (tripLocation.customTransportMode) {
            endpointNode.ele("Mode", tripLocation.customTransportMode);
          }
        });
      }
    }

    paramsNode.ele("UseRealtimeData", 'explanatory');
  }
}
