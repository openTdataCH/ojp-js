import * as xmlbuilder from "xmlbuilder";

import {
  GeoRestrictionType,
  GeoRestrictionPoiOSMTag,
} from "../../types/geo-restriction.type";
import { BaseRequestParams } from "../base-request-params";

export class LocationInformationRequestParams extends BaseRequestParams {
  public locationName: string | null;
  public stopPlaceRef: string | null;
  public geoRestrictionType: GeoRestrictionType | null;
  public poiOsmTags: GeoRestrictionPoiOSMTag[] | null;
  public numberOfResults: number | null;
  public bboxWest: number | null;
  public bboxNorth: number | null;
  public bboxEast: number | null;
  public bboxSouth: number | null;

  constructor() {
    super();

    this.locationName = null;
    this.stopPlaceRef = null;
    this.geoRestrictionType = null;
    this.poiOsmTags = null;
    this.numberOfResults = null;
    this.bboxWest = null;
    this.bboxNorth = null;
    this.bboxEast = null;
    this.bboxSouth = null;
  }

  public static initWithLocationName(
    locationName: string,
    geoRestrictionType: GeoRestrictionType | null = null
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams();
    requestParams.locationName = locationName;

    if (geoRestrictionType !== null) {
      requestParams.geoRestrictionType = geoRestrictionType;
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
    geoRestrictionType: GeoRestrictionType,
    limit: number = 1000,
    poiOsmTags: GeoRestrictionPoiOSMTag[] | null = null
  ): LocationInformationRequestParams {
    const requestParams = new LocationInformationRequestParams();
    requestParams.bboxWest = bboxWest;
    requestParams.bboxNorth = bboxNorth;
    requestParams.bboxEast = bboxEast;
    requestParams.bboxSouth = bboxSouth;
    requestParams.numberOfResults = limit;
    requestParams.geoRestrictionType = geoRestrictionType;
    requestParams.poiOsmTags = poiOsmTags;

    return requestParams;
  }

  protected buildRequestNode(): void {
    super.buildRequestNode();

    const now = new Date();
    const dateF = now.toISOString();
    this.serviceRequestNode.ele("siri:RequestTimestamp", dateF);

    const requestNode = this.serviceRequestNode.ele(
      "OJPLocationInformationRequest"
    );
    requestNode.ele("siri:RequestTimestamp", dateF);

    let initialInputNode: xmlbuilder.XMLElement | null = null;

    const locationName = this.locationName ?? null;
    if (locationName) {
      initialInputNode = requestNode.ele("InitialInput");
      initialInputNode.ele("Name", locationName);
    }

    const stopPlaceRef = this.stopPlaceRef ?? null;
    if (stopPlaceRef) {
      const requestPlaceRefNode = requestNode.ele("PlaceRef");
      requestPlaceRefNode.ele("siri:StopPointRef", stopPlaceRef);
      requestPlaceRefNode.ele("Name").ele("Text", "n/a");
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

    const numberOfResults = this.numberOfResults ?? 10;
    restrictionsNode.ele("NumberOfResults", numberOfResults);

    const geoRestrictionTypeS = this.computeRestrictionType();
    if (geoRestrictionTypeS) {
      restrictionsNode.ele("Type", geoRestrictionTypeS);

      const isPoiRequest =
        this.geoRestrictionType === "poi_amenity" ||
        this.geoRestrictionType === "poi_all";
      if (isPoiRequest && this.poiOsmTags) {
        const poiCategoryNode = restrictionsNode
          .ele("PointOfInterestFilter")
          .ele("PointOfInterestCategory");
        const poiOsmTagKey =
          this.geoRestrictionType === "poi_amenity" ? "amenity" : "POI";

        this.poiOsmTags.forEach((poiOsmTag) => {
          const osmTagNode = poiCategoryNode.ele("OsmTag");
          osmTagNode.ele("Tag", poiOsmTagKey);
          osmTagNode.ele("Value", poiOsmTag);
        });
      }
    }

    const extensionsNode = requestNode.ele("Extensions");
    extensionsNode
      .ele("ParamsExtension")
      .ele("PrivateModeFilter")
      .ele("Exclude", "false");
  }

  private computeRestrictionType(): string | null {
    if (this.geoRestrictionType === "stop") {
      return "stop";
    }

    if (this.geoRestrictionType === "poi_all") {
      return "poi";
    }

    if (this.geoRestrictionType === "poi_amenity") {
      return "poi";
    }

    return this.geoRestrictionType;
  }
}
