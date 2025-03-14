import { OJPBaseRequest } from '../base-request';
import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { TripRequestParser } from './trip-request-parser';
import { TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';
import { OJP_Helpers } from "../../helpers/ojp-helpers";
export class TripRequest extends OJPBaseRequest {
    constructor(stageConfig, language, fromTripLocation, toTripLocation, departureDate = new Date(), tripRequestBoardingType = 'Dep', numberOfResults = null, numberOfResultsBefore = null, numberOfResultsAfter = null, publicTransportModes = []) {
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
    static Empty() {
        const emptyTripLocationPoint = TripLocationPoint.Empty();
        const request = new TripRequest(EMPTY_API_CONFIG, 'en', emptyTripLocationPoint, emptyTripLocationPoint, new Date(), 'Dep');
        return request;
    }
    static initWithResponseMock(mockText) {
        const request = TripRequest.Empty();
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const request = TripRequest.Empty();
        request.mockRequestXML = mockText;
        request.requestInfo.requestXML = mockText;
        return request;
    }
    static initWithStopRefs(stageConfig, language, fromStopRef, toStopRef, departureDate = new Date(), tripRequestBoardingType = 'Dep') {
        const fromLocation = Location.initWithStopPlaceRef(fromStopRef);
        const toLocation = Location.initWithStopPlaceRef(toStopRef);
        const fromTripLocationPoint = new TripLocationPoint(fromLocation);
        const toTripLocationPoint = new TripLocationPoint(toLocation);
        const request = new TripRequest(stageConfig, language, fromTripLocationPoint, toTripLocationPoint, departureDate, tripRequestBoardingType);
        return request;
    }
    static initWithLocationsAndDate(stageConfig, language, fromLocation, toLocation, departureDate, tripRequestBoardingType = 'Dep') {
        const fromTripLocationPoint = new TripLocationPoint(fromLocation);
        const toTripLocationPoint = new TripLocationPoint(toLocation);
        const request = new TripRequest(stageConfig, language, fromTripLocationPoint, toTripLocationPoint, departureDate, tripRequestBoardingType);
        return request;
    }
    static initWithTripLocationsAndDate(stageConfig, language, fromTripLocation, toTripLocation, departureDate, tripRequestBoardingType = 'Dep', includeLegProjection = false, modeType = 'monomodal', transportMode = 'public_transport', viaTripLocations = [], numberOfResults = null, numberOfResultsBefore = null, numberOfResultsAfter = null, publicTransportModes = []) {
        if ((fromTripLocation === null) || (toTripLocation === null)) {
            return null;
        }
        if (!((fromTripLocation.location.geoPosition ||
            fromTripLocation.location.stopPlace) &&
            (toTripLocation.location.geoPosition ||
                toTripLocation.location.stopPlace))) {
            return null;
        }
        const request = new TripRequest(stageConfig, language, fromTripLocation, toTripLocation, departureDate, tripRequestBoardingType, numberOfResults, numberOfResultsBefore, numberOfResultsAfter, publicTransportModes);
        request.includeLegProjection = includeLegProjection;
        request.modeType = modeType;
        request.transportMode = transportMode;
        request.viaLocations = viaTripLocations;
        return request;
    }
    buildRequestNode() {
        super.buildRequestNode();
        const now = new Date();
        const dateF = now.toISOString();
        this.serviceRequestNode.ele("RequestTimestamp", dateF);
        this.serviceRequestNode.ele("RequestorRef", OJP_Helpers.buildRequestorRef());
        const tripRequestNode = this.serviceRequestNode.ele("ojp:OJPTripRequest");
        tripRequestNode.ele("RequestTimestamp", dateF);
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
            let tagName = isFrom ? "ojp:Origin" : "ojp:Destination";
            const endPointNode = tripRequestNode.ele(tagName);
            const placeRefNode = endPointNode.ele("ojp:PlaceRef");
            if ((_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) {
                const locationName = (_b = location.locationName) !== null && _b !== void 0 ? _b : "n/a";
                let stopPlaceRef = (_d = (_c = location.stopPlace) === null || _c === void 0 ? void 0 : _c.stopPlaceRef) !== null && _d !== void 0 ? _d : "";
                placeRefNode.ele("ojp:StopPlaceRef", stopPlaceRef);
                placeRefNode.ele("ojp:LocationName").ele("ojp:Text", locationName);
            }
            else {
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
            }
            else {
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
            var _a, _b, _c;
            const viaNode = tripRequestNode.ele('ojp:Via');
            const viaPointNode = viaNode.ele('ojp:ViaPoint');
            const stopPlace = viaLocation.location.stopPlace;
            if (stopPlace === null) {
                const geoPosition = viaLocation.location.geoPosition;
                if (geoPosition !== null) {
                    const geoPositionNode = viaPointNode.ele('ojp:GeoPosition');
                    geoPositionNode.ele('Longitude', geoPosition.longitude);
                    geoPositionNode.ele('Latitude', geoPosition.latitude);
                    viaPointNode.ele('ojp:Name').ele('ojp:Text', (_a = viaLocation.location.computeLocationName()) !== null && _a !== void 0 ? _a : 'n/a');
                }
            }
            else {
                viaPointNode.ele('ojp:StopPlaceRef', stopPlace.stopPlaceRef);
                viaPointNode.ele('ojp:LocationName').ele('ojp:Text', (_b = stopPlace.stopPlaceName) !== null && _b !== void 0 ? _b : ((_c = viaLocation.location.computeLocationName()) !== null && _c !== void 0 ? _c : 'n/a'));
            }
            if (viaLocation.dwellTimeMinutes !== null) {
                viaNode.ele('ojp:DwellTime', 'PT' + viaLocation.dwellTimeMinutes.toString() + 'M');
            }
        });
        const paramsNode = tripRequestNode.ele("ojp:Params");
        if (this.transportMode === 'public_transport' && (this.publicTransportModes.length > 0)) {
            // https://opentransportdata.swiss/en/cookbook/ojptriprequest/#Params
            const modeContainerNode = paramsNode.ele('PtModeFilter');
            modeContainerNode.ele('ojp:Exclude', 'false');
            this.publicTransportModes.forEach(publicTransportMode => {
                modeContainerNode.ele('ojp:PtMode', publicTransportMode);
            });
        }
        if (this.enableExtensions) {
            paramsNode.ele('ojp:PrivateModeFilter').ele('ojp:Exclude', 'false');
        }
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
        const sharingModes = [
            "bicycle_rental",
            "car_sharing",
            "escooter_rental",
        ];
        const isSharingMode = sharingModes.indexOf(transportMode) !== -1;
        if (isMonomodal) {
            const standardModes = [
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
        }
        else {
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
    addAdditionalRestrictions(nodeEl, tripLocation) {
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
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            this.parseTripRequestResponse(resolve);
        });
        return promise;
    }
    fetchResponseWithCallback(callback) {
        this.fetchOJPResponse().then((requestInfo) => {
            this.requestInfo = requestInfo;
            this.parseTripRequestResponse(callback);
        });
    }
    parseTripRequestResponse(callback) {
        this.response = null;
        if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
            const errorResponse = {
                tripsNo: 0,
                trips: [],
                message: null
            };
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
