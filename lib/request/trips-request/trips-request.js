var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { DEFAULT_STAGE } from '../../types/stage-config';
import { TripRequestParser } from './trip-request-parser';
export class TripRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        super(stageConfig);
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static initWithResponseMock(mockText) {
        const emptyRequestParams = TripsRequestParams.Empty();
        const request = new TripRequest(DEFAULT_STAGE, emptyRequestParams);
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText) {
        const emptyRequestParams = TripsRequestParams.Empty();
        const request = new TripRequest(DEFAULT_STAGE, emptyRequestParams);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithLocationsAndDate(stageConfig, fromLocation, toLocation, departureDate) {
        const requestParams = TripsRequestParams.initWithLocationsAndDate(fromLocation, toLocation, departureDate);
        if (requestParams === null) {
            return null;
        }
        const request = new TripRequest(stageConfig, requestParams);
        return request;
    }
    static initWithTripLocationsAndDate(stageConfig, fromTripLocation, toTripLocation, departureDate) {
        const requestParams = TripsRequestParams.initWithTripLocationsAndDate(fromTripLocation, toTripLocation, departureDate);
        if (requestParams === null) {
            return null;
        }
        const request = new TripRequest(stageConfig, requestParams);
        return request;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    fetchResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchOJPResponse();
            const promise = new Promise((resolve) => {
                this.parseTripRequestResponse(resolve);
            });
            return promise;
        });
    }
    fetchResponseWithCallback(callback) {
        this.fetchOJPResponse().then((requestInfo) => {
            this.requestInfo = requestInfo;
            this.parseTripRequestResponse(callback);
        });
    }
    parseTripRequestResponse(callback) {
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
            if (parserResponse.message === 'TripRequest.DONE') {
                this.sortTrips(parserResponse.trips);
            }
            if (parserResponse.message === 'TripRequest.Trip' && parserResponse.trips.length === 1) {
                this.requestInfo.parseDateTime = new Date();
            }
            callback(parserResponse);
        };
        parser.parseXML(this.requestInfo.responseXML);
    }
    sortTrips(trips) {
        var _a;
        const tripModeType = this.requestParams.modeType;
        const transportMode = this.requestParams.transportMode;
        if (tripModeType !== 'monomodal') {
            return;
        }
        // Push first the monomodal trip with one leg matching the transport mode
        const monomodalTrip = (_a = trips.find(trip => {
            if (trip.legs.length !== 1) {
                return false;
            }
            if (trip.legs[0].legType !== 'ContinousLeg') {
                return false;
            }
            const continousLeg = trip.legs[0];
            return continousLeg.legTransportMode === transportMode;
        })) !== null && _a !== void 0 ? _a : null;
        if (monomodalTrip) {
            const tripIdx = trips.indexOf(monomodalTrip);
            trips.splice(tripIdx, 1);
            trips.unshift(monomodalTrip);
        }
    }
}
