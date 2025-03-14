import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { LocationInformationParser } from './location-information-parser';
import { GeoPosition } from '../../location/geoposition';
import { OJP_Helpers } from '../../helpers/ojp-helpers';
export class LocationInformationRequest extends OJPBaseRequest {
    constructor(stageConfig, language) {
        super(stageConfig, language);
        this.locationName = null;
        this.stopPlaceRef = null;
        this.restrictionTypes = [];
        this.poiRestriction = null;
        this.numberOfResults = null;
        this.bboxWest = null;
        this.bboxNorth = null;
        this.bboxEast = null;
        this.bboxSouth = null;
        this.circleCenter = null;
        this.circleRadius = null;
        this.enableExtensions = true;
    }
    static initWithResponseMock(mockText) {
        const request = new LocationInformationRequest(EMPTY_API_CONFIG, 'en');
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const request = new LocationInformationRequest(stageConfig, 'en');
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithLocationName(stageConfig, language, locationName, restrictionTypes, limit = 10) {
        const request = new LocationInformationRequest(stageConfig, language);
        request.locationName = locationName;
        request.numberOfResults = limit;
        if (restrictionTypes !== null) {
            request.restrictionTypes = restrictionTypes;
        }
        return request;
    }
    static initWithStopPlaceRef(stageConfig, language, stopPlaceRef) {
        const request = new LocationInformationRequest(stageConfig, language);
        request.stopPlaceRef = stopPlaceRef;
        return request;
    }
    static initWithCircleLngLatRadius(stageConfig, language, circleLongitude, circleLatitude, circleRadius, restrictionTypes = [], numberOfResults = 1000) {
        const request = new LocationInformationRequest(stageConfig, language);
        request.circleCenter = new GeoPosition(circleLongitude, circleLatitude);
        request.circleRadius = circleRadius;
        request.restrictionTypes = restrictionTypes;
        request.numberOfResults = numberOfResults;
        return request;
    }
    static initWithBBOXAndType(stageConfig, language, bboxWest, bboxNorth, bboxEast, bboxSouth, restrictionTypes, limit = 1000, poiRestriction = null) {
        const request = new LocationInformationRequest(stageConfig, language);
        request.numberOfResults = limit;
        request.bboxWest = bboxWest;
        request.bboxNorth = bboxNorth;
        request.bboxEast = bboxEast;
        request.bboxSouth = bboxSouth;
        request.restrictionTypes = restrictionTypes;
        request.poiRestriction = poiRestriction;
        return request;
    }
    buildRequestNode() {
        var _a, _b, _c, _d, _e, _f, _g;
        super.buildRequestNode();
        const now = new Date();
        const dateF = now.toISOString();
        this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);
        this.serviceRequestNode.ele("siri:RequestorRef", OJP_Helpers.buildRequestorRef());
        const requestNode = this.serviceRequestNode.ele("OJPLocationInformationRequest");
        requestNode.ele("siri:RequestTimestamp", dateF);
        const locationName = (_a = this.locationName) !== null && _a !== void 0 ? _a : null;
        if (locationName !== null) {
            requestNode.ele('InitialInput').ele('Name', locationName);
        }
        const stopPlaceRef = (_b = this.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
        if (stopPlaceRef) {
            const requestPlaceRefNode = requestNode.ele("PlaceRef");
            requestPlaceRefNode.ele("siri:StopPointRef", stopPlaceRef);
            requestPlaceRefNode.ele("Name").ele("Text", "n/a");
        }
        const bboxWest = (_c = this.bboxWest) !== null && _c !== void 0 ? _c : null;
        const bboxNorth = (_d = this.bboxNorth) !== null && _d !== void 0 ? _d : null;
        const bboxEast = (_e = this.bboxEast) !== null && _e !== void 0 ? _e : null;
        const bboxSouth = (_f = this.bboxSouth) !== null && _f !== void 0 ? _f : null;
        if (bboxWest && bboxNorth && bboxEast && bboxSouth) {
            const rectangleNode = requestNode.ele('InitialInput')
                .ele("GeoRestriction")
                .ele("Rectangle");
            const upperLeftNode = rectangleNode.ele("UpperLeft");
            upperLeftNode.ele("siri:Longitude", bboxWest.toFixed(6));
            upperLeftNode.ele("siri:Latitude", bboxNorth.toFixed(6));
            const lowerRightNode = rectangleNode.ele("LowerRight");
            lowerRightNode.ele("siri:Longitude", bboxEast.toFixed(6));
            lowerRightNode.ele("siri:Latitude", bboxSouth.toFixed(6));
        }
        if (this.circleCenter !== null && this.circleRadius !== null) {
            const circleNode = requestNode.ele('InitialInput')
                .ele("GeoRestriction")
                .ele("Circle");
            const centerNode = circleNode.ele('Center');
            centerNode.ele('siri:Longitude', this.circleCenter.longitude.toFixed(6));
            centerNode.ele('siri:Latitude', this.circleCenter.latitude.toFixed(6));
            circleNode.ele('Radius', this.circleRadius);
        }
        const restrictionsNode = requestNode.ele("Restrictions");
        this.restrictionTypes.forEach(restrictionType => {
            restrictionsNode.ele("Type", restrictionType);
            const isPOI = restrictionType === 'poi';
            if (isPOI && this.poiRestriction) {
                const poiCategoryNode = restrictionsNode.ele("PointOfInterestFilter").ele("PointOfInterestCategory");
                const isSharedMobility = this.poiRestriction.poiType === 'shared_mobility';
                const poiOsmTagKey = isSharedMobility ? 'amenity' : 'POI';
                this.poiRestriction.tags.forEach((poiOsmTag) => {
                    const osmTagNode = poiCategoryNode.ele("OsmTag");
                    osmTagNode.ele("Tag", poiOsmTagKey);
                    osmTagNode.ele("Value", poiOsmTag);
                });
            }
        });
        const numberOfResults = (_g = this.numberOfResults) !== null && _g !== void 0 ? _g : 10;
        restrictionsNode.ele("NumberOfResults", numberOfResults);
        if (this.enableExtensions) {
            const extensionsNode = requestNode.ele("siri:Extensions");
            extensionsNode
                .ele("ParamsExtension")
                .ele("PrivateModeFilter")
                .ele("Exclude", "false");
        }
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
