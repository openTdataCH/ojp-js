import { EMPTY_API_CONFIG, ApiConfig } from '../../types/stage-config'
import { POI_Restriction, RestrictionType } from '../../types/lir-restrictions.type';
import { OJPBaseRequest } from '../base-request'
import { LocationInformationParser } from './location-information-parser';
import { LIR_Response } from '../types/location-information-request.type';
import { Location } from '../../location/location';
import { Language } from '../../types/language-type';
import { GeoPosition } from '../../location/geoposition';

export class LocationInformationRequest extends OJPBaseRequest {
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

  public enableExtensions: boolean;

  constructor(stageConfig: ApiConfig, language: Language) {
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

  public static initWithResponseMock(mockText: string) {
    const request = new LocationInformationRequest(EMPTY_API_CONFIG, 'en');
    request.mockResponseXML = mockText;
    
    return request;
  }

  public static initWithRequestMock(mockText: string, stageConfig: ApiConfig = EMPTY_API_CONFIG) {
    const request = new LocationInformationRequest(stageConfig, 'en');
    request.mockRequestXML = mockText;
    
    return request;
  }

  public static initWithLocationName(stageConfig: ApiConfig, language: Language, locationName: string, restrictionTypes: RestrictionType[], limit: number = 10): LocationInformationRequest {
    const request = new LocationInformationRequest(stageConfig, language);
    request.locationName = locationName;
    request.numberOfResults = limit;

    if (restrictionTypes !== null) {
      request.restrictionTypes = restrictionTypes;
    }

    return request;
  }

  public static initWithStopPlaceRef(stageConfig: ApiConfig, language: Language, stopPlaceRef: string): LocationInformationRequest {
    const request = new LocationInformationRequest(stageConfig, language);
    request.stopPlaceRef = stopPlaceRef;
    
    return request;
  }

  public static initWithCircleLngLatRadius(
    stageConfig: ApiConfig,
    language: Language, 
    circleLongitude: number, 
    circleLatitude: number,
    circleRadius: number,
    restrictionTypes: RestrictionType[] = [],
    numberOfResults: number = 1000
  ): LocationInformationRequest {
    const request = new LocationInformationRequest(stageConfig, language);
    
    request.circleCenter = new GeoPosition(circleLongitude, circleLatitude);
    request.circleRadius = circleRadius;
    request.restrictionTypes = restrictionTypes;
    request.numberOfResults = numberOfResults;
    
    return request;
  }

  public static initWithBBOXAndType(
    stageConfig: ApiConfig,
    language: Language, 
    bboxWest: number,
    bboxNorth: number,
    bboxEast: number,
    bboxSouth: number,
    restrictionTypes: RestrictionType[],
    limit: number = 1000,
    poiRestriction: POI_Restriction | null = null,
  ): LocationInformationRequest {
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

  protected buildRequestNode(): void {
    super.buildRequestNode();

    const now = new Date();
    const dateF = now.toISOString();

    const requestNode = this.serviceRequestNode.ele(
      "OJPLocationInformationRequest"
    );
    requestNode.ele("siri:RequestTimestamp", dateF);

    const locationName = this.locationName ?? null;
    if (locationName !== null) {
      requestNode.ele('InitialInput').ele('Name', locationName);
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

    const numberOfResults = this.numberOfResults ?? 10;
    restrictionsNode.ele("NumberOfResults", numberOfResults);

    if (this.enableExtensions) {
      const extensionsNode = requestNode.ele("siri:Extensions");
      extensionsNode
        .ele("ParamsExtension")
        .ele("PrivateModeFilter")
        .ele("Exclude", "false");
    }
  }

  public async fetchResponse(): Promise<LIR_Response> {
    await this.fetchOJPResponse();

    const promise = new Promise<LIR_Response>((resolve) => {
      const response: LIR_Response = {
        locations: [],
        message: null,
      }
      
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

  public async fetchLocations(): Promise<Location[]> {
    const apiPromise = await this.fetchResponse();
    const promise = new Promise<Location[]>((resolve) => {
      if (apiPromise.message === 'LocationInformation.DONE') {
        resolve(apiPromise.locations);
      }
    });
    
    return promise;
  }
}
