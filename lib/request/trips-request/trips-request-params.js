import { TripLocationPoint } from "../../trip";
import { BaseRequestParams } from "../base-request-params";
import { SDK_VERSION } from "../..";
export class TripsRequestParams extends BaseRequestParams {
    constructor(fromTripLocation, toTripLocation, depArrTime, dateType) {
        super();
        this.fromTripLocation = fromTripLocation;
        this.toTripLocation = toTripLocation;
        this.depArrDate = depArrTime;
        this.dateType = dateType !== null && dateType !== void 0 ? dateType : 'Departure';
        this.modeType = "monomodal";
        this.transportMode = "public_transport";
        this.includeLegProjection = true;
        this.useNumberOfResultsAfter = true;
    }
    static Empty() {
        const emptyTripLocationPoint = TripLocationPoint.Empty();
        const requestParams = new TripsRequestParams(emptyTripLocationPoint, emptyTripLocationPoint, new Date());
        return requestParams;
    }
    static initWithLocationsAndDate(fromLocation, toLocation, depArrDate, dateType) {
        if (fromLocation === null || toLocation === null) {
            return null;
        }
        const fromTripLocationPoint = new TripLocationPoint(fromLocation);
        const toTripLocationPoint = new TripLocationPoint(toLocation);
        const requestParams = TripsRequestParams.initWithTripLocationsAndDate(fromTripLocationPoint, toTripLocationPoint, depArrDate, dateType);
        return requestParams;
    }
    static initWithTripLocationsAndDate(fromTripLocationPoint, toTripLocationPoint, departureDate, dateType) {
        if (fromTripLocationPoint === null || toTripLocationPoint === null) {
            return null;
        }
        // Both locations should have a geoPosition OR stopPlace
        if (!((fromTripLocationPoint.location.geoPosition ||
            fromTripLocationPoint.location.stopPlace) &&
            (toTripLocationPoint.location.geoPosition ||
                toTripLocationPoint.location.stopPlace))) {
            return null;
        }
        const tripRequestParams = new TripsRequestParams(fromTripLocationPoint, toTripLocationPoint, departureDate, dateType);
        return tripRequestParams;
    }
    buildRequestNode() {
        super.buildRequestNode();
        const now = new Date();
        const dateF = now.toISOString();
        this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);
        this.serviceRequestNode.ele("siri:RequestorRef", "OJP_JS_SDK_v" + SDK_VERSION);
        const tripRequestNode = this.serviceRequestNode.ele("OJPTripRequest");
        tripRequestNode.ele("siri:RequestTimestamp", dateF);
        const modeType = this.modeType;
        const isMonomodal = modeType === "monomodal";
        const transportMode = this.transportMode;
        const tripEndpoints = ["From", "To"];
        tripEndpoints.forEach((tripEndpoint) => {
            var _a, _b, _c, _d;
            const isFrom = tripEndpoint === "From";
            const tripLocation = isFrom
                ? this.fromTripLocation
                : this.toTripLocation;
            const location = tripLocation.location;
            let tagName = isFrom ? "Origin" : "Destination";
            const endPointNode = tripRequestNode.ele(tagName);
            const placeRefNode = endPointNode.ele("PlaceRef");
            if ((_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) {
                const locationName = (_b = location.locationName) !== null && _b !== void 0 ? _b : "n/a";
                let stopPlaceRef = (_d = (_c = location.stopPlace) === null || _c === void 0 ? void 0 : _c.stopPlaceRef) !== null && _d !== void 0 ? _d : "";
                placeRefNode.ele("StopPlaceRef", stopPlaceRef);
                placeRefNode.ele("Name").ele("Text", locationName);
            }
            else {
                if (location.geoPosition) {
                    const geoPositionNode = placeRefNode.ele("GeoPosition");
                    geoPositionNode.ele("siri:Longitude", location.geoPosition.longitude);
                    geoPositionNode.ele("siri:Latitude", location.geoPosition.latitude);
                    const locationName = location.geoPosition.asLatLngString();
                    placeRefNode.ele("Name").ele("Text", locationName);
                }
            }
            const dateF = this.depArrDate.toISOString();
            if (isFrom && this.dateType === 'Departure') {
                endPointNode.ele("DepArrTime", dateF);
            }
            else if (!isFrom && this.dateType === 'Arrival') {
                endPointNode.ele("DepArrTime", dateF);
            }
            if (isMonomodal) {
                if (isFrom) {
                    // https://github.com/openTdataCH/ojp-demo-app-src/issues/64
                    // Allow maxduration for more than 40m for walking / cycle monomodal routes
                    const modesWithOptions = ["walk", "cycle"];
                    if (modesWithOptions.indexOf(transportMode) !== -1) {
                        const transportModeOptionsNode = endPointNode.ele("IndividualTransportOptions");
                        transportModeOptionsNode.ele("Mode", transportMode);
                        if (transportMode === "walk") {
                            transportModeOptionsNode.ele("MaxDuration", "PT3000M");
                        }
                        if (transportMode === "cycle") {
                            transportModeOptionsNode.ele("MaxDuration", "PT600M");
                        }
                    }
                }
            }
            else {
                const isOthersDriveCar = transportMode === "taxi" || transportMode === "others-drive-car";
                if (isOthersDriveCar) {
                    const hasExtension = (() => {
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
                        const transportModeOptionsNode = endPointNode.ele("IndividualTransportOptions");
                        if (tripLocation.customTransportMode) {
                            transportModeOptionsNode.ele("Mode", tripLocation.customTransportMode);
                        }
                        transportModeOptionsNode.ele("MinDuration", "PT" + tripLocation.minDuration + "M");
                        transportModeOptionsNode.ele("MaxDuration", "PT" + tripLocation.maxDuration + "M");
                        transportModeOptionsNode.ele("MinDistance", tripLocation.minDistance);
                        transportModeOptionsNode.ele("MaxDistance", tripLocation.maxDistance);
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
        paramsNode.ele("IncludeLegProjection", this.includeLegProjection);
        paramsNode.ele("IncludeTurnDescription", true);
        paramsNode.ele("IncludeIntermediateStops", true);
        if (isMonomodal) {
            const standardModes = [
                "walk",
                "self-drive-car",
                "cycle",
                "taxi",
                "others-drive-car",
            ];
            if (standardModes.indexOf(transportMode) !== -1) {
                paramsNode.ele("ItModesToCover", transportMode);
            }
            const sharingModes = [
                "bicycle_rental",
                "car_sharing",
                "escooter_rental",
            ];
            const isExtension = sharingModes.indexOf(transportMode) !== -1;
            if (isExtension) {
                const paramsExtensionNode = paramsNode.ele("Extension");
                paramsExtensionNode.ele("ItModesToCover", transportMode);
            }
        }
        else {
            const isOthersDriveCar = transportMode === "taxi" || transportMode === "others-drive-car";
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
                    endpointNode.ele("MinDuration", "PT" + tripLocation.minDuration + "M");
                    endpointNode.ele("MaxDuration", "PT" + tripLocation.maxDuration + "M");
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
