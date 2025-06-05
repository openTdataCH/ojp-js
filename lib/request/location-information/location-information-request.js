import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { LocationInformationParser } from './location-information-parser';
import { GeoPosition } from '../../location/geoposition';
export class LocationInformationRequest extends OJPBaseRequest {
    constructor(stageConfig, language, xmlConfig, requestorRef) {
        super(stageConfig, language, xmlConfig, requestorRef);
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
    static initWithResponseMock(mockText, xmlConfig, requestorRef) {
        const request = new LocationInformationRequest(EMPTY_API_CONFIG, 'en', xmlConfig, requestorRef);
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig, xmlConfig, requestorRef) {
        const request = new LocationInformationRequest(stageConfig, 'en', xmlConfig, requestorRef);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithLocationName(stageConfig, language, xmlConfig, requestorRef, locationName, restrictionTypes, limit = 10) {
        const request = new LocationInformationRequest(stageConfig, language, xmlConfig, requestorRef);
        request.locationName = locationName;
        request.numberOfResults = limit;
        if (restrictionTypes !== null) {
            request.restrictionTypes = restrictionTypes;
        }
        return request;
    }
    static initWithStopPlaceRef(stageConfig, language, xmlConfig, requestorRef, stopPlaceRef) {
        const request = new LocationInformationRequest(stageConfig, language, xmlConfig, requestorRef);
        request.stopPlaceRef = stopPlaceRef;
        return request;
    }
    static initWithCircleLngLatRadius(stageConfig, language, xmlConfig, requestorRef, circleLongitude, circleLatitude, circleRadius, restrictionTypes = [], numberOfResults = 1000) {
        const request = new LocationInformationRequest(stageConfig, language, xmlConfig, requestorRef);
        request.circleCenter = new GeoPosition(circleLongitude, circleLatitude);
        request.circleRadius = circleRadius;
        request.restrictionTypes = restrictionTypes;
        request.numberOfResults = numberOfResults;
        return request;
    }
    static initWithBBOXAndType(stageConfig, language, xmlConfig, requestorRef, bboxWest, bboxNorth, bboxEast, bboxSouth, restrictionTypes, limit = 1000, poiRestriction = null) {
        const request = new LocationInformationRequest(stageConfig, language, xmlConfig, requestorRef);
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
        const siriPrefix = this.xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const ojpPrefix = this.xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const isOJPv2 = this.xmlConfig.ojpVersion === '2.0';
        const now = new Date();
        const dateF = now.toISOString();
        const requestNode = this.serviceRequestNode.ele(ojpPrefix + 'OJPLocationInformationRequest');
        requestNode.ele(siriPrefix + "RequestTimestamp", dateF);
        const nameTag = isOJPv2 ? 'Name' : 'LocationName';
        const locationName = (_a = this.locationName) !== null && _a !== void 0 ? _a : null;
        if (locationName !== null) {
            requestNode.ele(ojpPrefix + 'InitialInput').ele(ojpPrefix + nameTag, locationName);
        }
        const stopPlaceRef = (_b = this.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
        if (stopPlaceRef) {
            const requestPlaceRefNode = requestNode.ele(ojpPrefix + "PlaceRef");
            const stopPointRefNode = isOJPv2 ? (siriPrefix + 'StopPointRef') : (ojpPrefix + 'StopPlaceRef');
            requestPlaceRefNode.ele(stopPointRefNode, stopPlaceRef);
            requestPlaceRefNode.ele(ojpPrefix + nameTag).ele(ojpPrefix + "Text", "n/a");
        }
        const bboxWest = (_c = this.bboxWest) !== null && _c !== void 0 ? _c : null;
        const bboxNorth = (_d = this.bboxNorth) !== null && _d !== void 0 ? _d : null;
        const bboxEast = (_e = this.bboxEast) !== null && _e !== void 0 ? _e : null;
        const bboxSouth = (_f = this.bboxSouth) !== null && _f !== void 0 ? _f : null;
        if (bboxWest && bboxNorth && bboxEast && bboxSouth) {
            const rectangleNode = requestNode.ele(ojpPrefix + 'InitialInput')
                .ele(ojpPrefix + "GeoRestriction")
                .ele(ojpPrefix + "Rectangle");
            const upperLeftNode = rectangleNode.ele(ojpPrefix + "UpperLeft");
            upperLeftNode.ele(siriPrefix + "Longitude", bboxWest.toFixed(6));
            upperLeftNode.ele(siriPrefix + "Latitude", bboxNorth.toFixed(6));
            const lowerRightNode = rectangleNode.ele(ojpPrefix + "LowerRight");
            lowerRightNode.ele(siriPrefix + "Longitude", bboxEast.toFixed(6));
            lowerRightNode.ele(siriPrefix + "Latitude", bboxSouth.toFixed(6));
        }
        if (this.circleCenter !== null && this.circleRadius !== null) {
            const circleNode = requestNode.ele(ojpPrefix + 'InitialInput')
                .ele(ojpPrefix + "GeoRestriction")
                .ele(ojpPrefix + "Circle");
            const centerNode = circleNode.ele(ojpPrefix + 'Center');
            centerNode.ele(siriPrefix + 'Longitude', this.circleCenter.longitude.toFixed(6));
            centerNode.ele(siriPrefix + 'Latitude', this.circleCenter.latitude.toFixed(6));
            circleNode.ele(ojpPrefix + 'Radius', this.circleRadius);
        }
        const restrictionsNode = requestNode.ele(ojpPrefix + "Restrictions");
        this.restrictionTypes.forEach(restrictionType => {
            restrictionsNode.ele(ojpPrefix + "Type", restrictionType);
            const isPOI = restrictionType === 'poi';
            if (isPOI && this.poiRestriction) {
                const poiCategoryNode = restrictionsNode.ele(ojpPrefix + "PointOfInterestFilter").ele(ojpPrefix + "PointOfInterestCategory");
                const isSharedMobility = this.poiRestriction.poiType === 'shared_mobility';
                const poiOsmTagKey = isSharedMobility ? 'amenity' : 'POI';
                this.poiRestriction.tags.forEach((poiOsmTag) => {
                    const osmTagNode = poiCategoryNode.ele(ojpPrefix + "OsmTag");
                    osmTagNode.ele(ojpPrefix + "Tag", poiOsmTagKey);
                    osmTagNode.ele(ojpPrefix + "Value", poiOsmTag);
                });
            }
        });
        const numberOfResults = (_g = this.numberOfResults) !== null && _g !== void 0 ? _g : 10;
        restrictionsNode.ele(ojpPrefix + "NumberOfResults", numberOfResults);
        if (this.enableExtensions) {
            const extensionsNode = requestNode.ele(siriPrefix + "Extensions");
            extensionsNode
                .ele(ojpPrefix + "ParamsExtension")
                .ele(ojpPrefix + "PrivateModeFilter")
                .ele(ojpPrefix + "Exclude", "false");
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
            const parser = new LocationInformationParser(this.xmlConfig);
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
