import { RestrictionType, POI_Restriction } from "../../types/lir-restrictions.type";
import { BaseRequestParams } from "../base-request-params";

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

  public static initWithLocationName(
    locationName: string,
    restrictionTypes: RestrictionType[] | null = null,
    limit: number = 10,
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams();
    requestParams.locationName = locationName;
    requestParams.numberOfResults = limit;

    if (restrictionTypes !== null) {
      requestParams.restrictionTypes = restrictionTypes;
    }

    return requestParams;
  }

  public static initWithStopPlaceRef(
    stopPlaceRef: string
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams();
    requestParams.stopPlaceRef = stopPlaceRef;

    return requestParams;
  }

  public static initWithBBOXAndType(
    bboxWest: number,
    bboxNorth: number,
    bboxEast: number,
    bboxSouth: number,
    restrictionTypes: RestrictionType[],
    limit: number = 1000,
    poiRestriction: POI_Restriction | null = null 
  ): LocationInformationRequestParams {
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

  protected buildRequestNode(): void {
    super.buildRequestNode();

    const now = new Date();
    const dateF = now.toISOString();
    this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);

    this.serviceRequestNode.ele("siri:RequestorRef", this.buildRequestorRef());

    const requestNode = this.serviceRequestNode.ele(
      "OJPLocationInformationRequest"
    );
    requestNode.ele("siri:RequestTimestamp", dateF);

    let initialInputNode: xmlbuilder.XMLElement | null = null;

    const locationName = this.locationName ?? null;
    if (locationName) {
      initialInputNode = requestNode.ele("InitialInput");
      initialInputNode.ele("LocationName", locationName);
    }

    const stopPlaceRef = this.stopPlaceRef ?? null;
    if (stopPlaceRef) {
      const requestPlaceRefNode = requestNode.ele("PlaceRef");
      requestPlaceRefNode.ele("StopPlaceRef", stopPlaceRef);
      requestPlaceRefNode.ele("LocationName").ele("Text", "n/a");
    }

    const bboxWest = this.bboxWest ?? null;
    const bboxNorth = this.bboxNorth ?? null;
    const bboxEast = this.bboxEast ?? null;
    const bboxSouth = this.bboxSouth ?? null;
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

    const numberOfResults = this.numberOfResults ?? 10;
    restrictionsNode.ele("NumberOfResults", numberOfResults);

    const extensionsNode = requestNode.ele("siri:Extensions");
    extensionsNode
      .ele("ParamsExtension")
      .ele("PrivateModeFilter")
      .ele("Exclude", "false");
  }
}
