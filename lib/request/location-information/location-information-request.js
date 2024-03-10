import { DEFAULT_STAGE } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { LocationInformationParser } from './location-information-parser';
import { LocationInformationRequestParams } from './location-information-request-params';
export class LocationInformationRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        super(stageConfig);
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static initWithResponseMock(mockText) {
        const emptyRequestParams = new LocationInformationRequestParams();
        const request = new LocationInformationRequest(DEFAULT_STAGE, emptyRequestParams);
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithLocationName(stageConfig, locationName, geoRestrictionType = null) {
        const requestParams = LocationInformationRequestParams.initWithLocationName(locationName, geoRestrictionType);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    static initWithStopPlaceRef(stageConfig, stopPlaceRef) {
        const requestParams = LocationInformationRequestParams.initWithStopPlaceRef(stopPlaceRef);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    static initWithBBOXAndType(stageConfig, bboxWest, bboxNorth, bboxEast, bboxSouth, geoRestrictionType, limit = 1000, poiOsmTags = null) {
        const requestParams = LocationInformationRequestParams.initWithBBOXAndType(bboxWest, bboxNorth, bboxEast, bboxSouth, geoRestrictionType, limit, poiOsmTags);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            const response = {
                locations: [],
                message: null,
            };
            if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
                response.message = 'ERROR';
                resolve(response);
                return;
            }
            const parser = new LocationInformationParser();
            parser.callback = ({ locations, message }) => {
                response.locations = locations;
                response.message = message;
                if (message === 'LocationInformation.DONE') {
                    this.requestInfo.parseDateTime = new Date();
                }
                resolve(response);
            };
            parser.parseXML(this.requestInfo.responseXML);
        });
        return promise;
    }
    async fetchLocations() {
        const apiPromise = await this.fetchResponse();
        const promise = new Promise((resolve) => {
            if (apiPromise.message === 'LocationInformation.DONE') {
                resolve(apiPromise.locations);
            }
        });
        return promise;
    }
}
