import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { TripModeType } from "../../types/trip-mode-type";
import { BaseRequestParams } from "../base-request-params";
import { JourneyPointType } from '../../types/journey-points';
import { Location } from "../../location/location";

export class TripsRequestParams extends BaseRequestParams {
  public fromTripLocation: TripLocationPoint;
  public toTripLocation: TripLocationPoint;
  public departureDate: Date;
  public modeType: TripModeType;
  public transportMode: IndividualTransportMode;
  public includeLegProjection: boolean;
  public useNumberOfResultsAfter: boolean;

  constructor(
    fromTripLocation: TripLocationPoint,
    toTripLocation: TripLocationPoint,
    departureDate: Date
  ) {
    super();

    this.fromTripLocation = fromTripLocation;
    this.toTripLocation = toTripLocation;
    this.departureDate = departureDate;

    this.modeType = "monomodal";
    this.transportMode = "public_transport";

    this.includeLegProjection = true;
    this.useNumberOfResultsAfter = true;
  }

  public static Empty(): TripsRequestParams {
    const emptyTripLocationPoint = TripLocationPoint.Empty();
    const requestParams = new TripsRequestParams(
      emptyTripLocationPoint,
      emptyTripLocationPoint,
      new Date()
    );
    return requestParams;
  }

  public static initWithTripLocationsAndDate(
    fromTripLocationPoint: TripLocationPoint | null,
    toTripLocationPoint: TripLocationPoint | null,
    departureDate: Date
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
      fromTripLocationPoint,
      toTripLocationPoint,
      departureDate
    );
    return tripRequestParams;
  }

  protected buildRequestNode(): void {
    const now = new Date();
    const dateF = now.toISOString();
    this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);

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

      if (isFrom) {
        const dateF = this.departureDate.toISOString();
        endPointNode.ele("DepArrTime", dateF);
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

    const paramsNode = tripRequestNode.ele("Params");

    const numberOfResults = 5;
    const nodeName = this.useNumberOfResultsAfter
      ? "NumberOfResultsAfter"
      : "NumberOfResults";
    paramsNode.ele(nodeName, numberOfResults);
    if (this.useNumberOfResultsAfter) {
      // https://github.com/openTdataCH/ojp-demo-app-src/issues/108
      // NumberOfResultsAfter and NumberOfResultsBefore are always used together
      paramsNode.ele("NumberOfResultsBefore", 0);
    }

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
  }
}
