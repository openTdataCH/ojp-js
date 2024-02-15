import { DEFAULT_STAGE, StageConfig } from '../../types/stage-config'
import { GeoRestrictionPoiOSMTag, GeoRestrictionType } from '../../types/geo-restriction.type';
import { OJPBaseRequest } from '../base-request'
import { LocationInformationParser } from './location-information-parser';
import { LIR_Response } from '../types/location-information-request.type';
import { Location } from '../../location/location';
import { LocationInformationRequestParams } from './location-information-request-params';

export class LocationInformationRequest extends OJPBaseRequest {
  private requestParams: LocationInformationRequestParams;

  constructor(stageConfig: StageConfig, requestParams: LocationInformationRequestParams) {
    super(stageConfig);
    this.requestParams = requestParams;
    this.requestInfo.requestXML = this.buildRequestXML();
  }

  public static initWithResponseMock(mockText: string) {
    const emptyRequestParams = new LocationInformationRequestParams();
    const request = new LocationInformationRequest(DEFAULT_STAGE, emptyRequestParams);
    request.mockResponseXML = mockText;
    
    return request;
  }

  public static initWithLocationName(stageConfig: StageConfig, locationName: string, geoRestrictionType: GeoRestrictionType | null = null): LocationInformationRequest {
    const requestParams = LocationInformationRequestParams.initWithLocationName(locationName, geoRestrictionType);
    const request = new LocationInformationRequest(stageConfig, requestParams);
    return request;
  }

  public static initWithStopPlaceRef(stageConfig: StageConfig, stopPlaceRef: string): LocationInformationRequest {
    const requestParams = LocationInformationRequestParams.initWithStopPlaceRef(stopPlaceRef);
    const request = new LocationInformationRequest(stageConfig, requestParams);
    return request;
  }

  public static initWithBBOXAndType(
    stageConfig: StageConfig,
    bboxWest: number,
    bboxNorth: number,
    bboxEast: number,
    bboxSouth: number,
    geoRestrictionType: GeoRestrictionType,
    limit: number = 1000,
    poiOsmTags: GeoRestrictionPoiOSMTag[] | null = null
  ): LocationInformationRequest {
    const requestParams = LocationInformationRequestParams.initWithBBOXAndType(bboxWest, bboxNorth, bboxEast, bboxSouth, geoRestrictionType, limit, poiOsmTags);
    const request = new LocationInformationRequest(stageConfig, requestParams);
    return request;
  }

  protected buildRequestXML(): string {
    return this.requestParams.buildRequestXML();
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
