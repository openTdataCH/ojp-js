import { BaseRequestParams } from "../base-request-params";
export class LocationInformationRequestParams extends BaseRequestParams {
    constructor() {
        super();
        this.locationName = null;
        this.stopPlaceRef = null;
        this.restrictionTypes = [];
        this.poiRestriction = null;
        this.numberOfResults = null;
        this.bboxWest = null;
        this.bboxNorth = null;
        this.bboxEast = null;
        this.bboxSouth = null;
    }
    static initWithLocationName(locationName, restrictionTypes = null, limit = 10) {
        const requestParams = new LocationInformationRequestParams();
        requestParams.locationName = locationName;
        requestParams.numberOfResults = limit;
        if (restrictionTypes !== null) {
            requestParams.restrictionTypes = restrictionTypes;
        }
        return requestParams;
    }
    static initWithStopPlaceRef(stopPlaceRef) {
        const requestParams = new LocationInformationRequestParams();
        requestParams.stopPlaceRef = stopPlaceRef;
        return requestParams;
    }
    static initWithBBOXAndType(bboxWest, bboxNorth, bboxEast, bboxSouth, restrictionTypes, limit = 1000, poiRestriction = null) {
        const requestParams = new LocationInformationRequestParams();
        requestParams.bboxWest = bboxWest;
        requestParams.bboxNorth = bboxNorth;
        requestParams.bboxEast = bboxEast;
        requestParams.bboxSouth = bboxSouth;
        requestParams.numberOfResults = limit;
        requestParams.restrictionTypes = restrictionTypes;
        requestParams.poiRestriction = poiRestriction;
        return requestParams;
    }
    buildRequestNode() {
        var _a, _b, _c, _d, _e, _f, _g;
        super.buildRequestNode();
        const now = new Date();
        const dateF = now.toISOString();
        this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);
        this.serviceRequestNode.ele("siri:RequestorRef", this.buildRequestorRef());
        const requestNode = this.serviceRequestNode.ele("OJPLocationInformationRequest");
        requestNode.ele("siri:RequestTimestamp", dateF);
        let initialInputNode = null;
        const locationName = (_a = this.locationName) !== null && _a !== void 0 ? _a : null;
        if (locationName) {
            initialInputNode = requestNode.ele("InitialInput");
            initialInputNode.ele("Name", locationName);
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
            if (initialInputNode === null) {
                initialInputNode = requestNode.ele("InitialInput");
            }
            const rectangleNode = initialInputNode
                .ele("GeoRestriction")
                .ele("Rectangle");
            const upperLeftNode = rectangleNode.ele("UpperLeft");
            upperLeftNode.ele("siri:Longitude", bboxWest.toFixed(6));
            upperLeftNode.ele("siri:Latitude", bboxNorth.toFixed(6));
            const lowerRightNode = rectangleNode.ele("LowerRight");
            lowerRightNode.ele("siri:Longitude", bboxEast.toFixed(6));
            lowerRightNode.ele("siri:Latitude", bboxSouth.toFixed(6));
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
        const extensionsNode = requestNode.ele("siri:Extensions");
        extensionsNode
            .ele("ParamsExtension")
            .ele("PrivateModeFilter")
            .ele("Exclude", "false");
    }
}
