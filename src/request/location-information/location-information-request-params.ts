import { RestrictionType, POI_Restriction } from "../../types/lir-restrictions.type";
import { BaseRequestParams } from "../base-request-params";
import { GeoPosition } from "../../location/geoposition";
import { Language } from "../../types/language-type";

export class LocationInformationRequestParams extends BaseRequestParams {
  public locationName: string | null;
  public stopPlaceRef: string | null;
  
  public restrictionTypes: RestrictionType[];
  public poiRestriction: POI_Restriction | null;
  
  public numberOfResults: number | null;
  public bboxWest: number | null;
  public bboxNorth: number | null;
  public bboxEast: number | null;
  public bboxSouth: number | null;

  public circleCenter: GeoPosition | null;
  public circleRadius: number | null;

  constructor(language: Language) {
    super(language);

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
  }

  public static initWithLocationName(
    language: Language,
    locationName: string,
    restrictionTypes: RestrictionType[] | null = null,
    limit: number = 10,
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams(language);
    
    requestParams.locationName = locationName;
    requestParams.numberOfResults = limit;

    if (restrictionTypes !== null) {
      requestParams.restrictionTypes = restrictionTypes;
    }

    return requestParams;
  }

  public static initWithStopPlaceRef(
    language: Language,
    stopPlaceRef: string,
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams(language);
    requestParams.stopPlaceRef = stopPlaceRef;

    return requestParams;
  }

  public static initWithBBOXAndType(
    language: Language,
    bboxWest: number,
    bboxNorth: number,
    bboxEast: number,
    bboxSouth: number,
    restrictionTypes: RestrictionType[],
    limit: number = 1000,
    poiRestriction: POI_Restriction | null = null,
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams(language);
    
    requestParams.bboxWest = bboxWest;
    requestParams.bboxNorth = bboxNorth;
    requestParams.bboxEast = bboxEast;
    requestParams.bboxSouth = bboxSouth;
    requestParams.numberOfResults = limit;
    requestParams.restrictionTypes = restrictionTypes;
    requestParams.poiRestriction = poiRestriction;

    return requestParams;
  }

  public static initWithCircleLngLatRadius(
    language: Language,
    circleLongitude: number, 
    circleLatitude: number,
    circleRadius: number,
    restrictionTypes: RestrictionType[] = [],
    numberOfResults: number = 1000,
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams(language);

    requestParams.circleCenter = new GeoPosition(circleLongitude, circleLatitude);
    requestParams.circleRadius = circleRadius;
    requestParams.restrictionTypes = restrictionTypes;
    requestParams.numberOfResults = numberOfResults;

    return requestParams;
  }

  protected buildRequestNode(): void {
    super.buildRequestNode();

    const now = new Date();
    const dateF = now.toISOString();
    this.serviceRequestNode.ele("RequestTimestamp", dateF);

    this.serviceRequestNode.ele("RequestorRef", BaseRequestParams.buildRequestorRef());

    const requestNode = this.serviceRequestNode.ele("ojp:OJPLocationInformationRequest");
    requestNode.ele("RequestTimestamp", dateF);

    const locationName = this.locationName ?? null;
    if (locationName !== null) {
      requestNode.ele('ojp:InitialInput').ele('ojp:LocationName', locationName);
    }

    const stopPlaceRef = this.stopPlaceRef ?? null;
    if (stopPlaceRef) {
      const requestPlaceRefNode = requestNode.ele("ojp:PlaceRef");
      requestPlaceRefNode.ele("ojp:StopPlaceRef", stopPlaceRef);
      requestPlaceRefNode.ele("ojp:LocationName").ele("Text", "n/a");
    }

    const bboxWest = this.bboxWest ?? null;
    const bboxNorth = this.bboxNorth ?? null;
    const bboxEast = this.bboxEast ?? null;
    const bboxSouth = this.bboxSouth ?? null;
    if (bboxWest && bboxNorth && bboxEast && bboxSouth) {
      const rectangleNode = requestNode.ele('ojp:InitialInput')
        .ele("ojp:GeoRestriction")
        .ele("ojp:Rectangle");

      const upperLeftNode = rectangleNode.ele("ojp:UpperLeft");
      upperLeftNode.ele("Longitude", bboxWest.toFixed(6));
      upperLeftNode.ele("Latitude", bboxNorth.toFixed(6));

      const lowerRightNode = rectangleNode.ele("LowerRight");
      lowerRightNode.ele("Longitude", bboxEast.toFixed(6));
      lowerRightNode.ele("Latitude", bboxSouth.toFixed(6));
    }

    if (this.circleCenter !== null && this.circleRadius !== null) {
      const circleNode = requestNode.ele('ojp:InitialInput')
        .ele("ojp:GeoRestriction")
        .ele("ojp:Circle");

      const centerNode = circleNode.ele('ojp:Center');
      centerNode.ele('Longitude', this.circleCenter.longitude.toFixed(6));
      centerNode.ele('Latitude', this.circleCenter.latitude.toFixed(6));

      circleNode.ele('Radius', this.circleRadius);
    }

    const restrictionsNode = requestNode.ele("ojp:Restrictions");

    this.restrictionTypes.forEach(restrictionType => {
      restrictionsNode.ele("ojp:Type", restrictionType);

      const isPOI = restrictionType === 'poi';
      if (isPOI && this.poiRestriction) {
        const poiCategoryNode = restrictionsNode.ele("ojp:PointOfInterestFilter").ele("PointOfInterestCategory");

        const isSharedMobility = this.poiRestriction.poiType === 'shared_mobility';
        const poiOsmTagKey = isSharedMobility ? 'amenity' : 'POI';
        this.poiRestriction.tags.forEach((poiOsmTag) => {
          const osmTagNode = poiCategoryNode.ele("OsmTag");
          osmTagNode.ele("ojp:Tag", poiOsmTagKey);
          osmTagNode.ele("ojp:Value", poiOsmTag);
        });
      }
    });

    const numberOfResults = this.numberOfResults ?? 10;
    restrictionsNode.ele("ojp:NumberOfResults", numberOfResults);

    const extensionsNode = requestNode.ele("Extensions");
    extensionsNode
      .ele("ojp:ParamsExtension")
      .ele("ojp:PrivateModeFilter")
      .ele("ojp:Exclude", "false");
  }
}
