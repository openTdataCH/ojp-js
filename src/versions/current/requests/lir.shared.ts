import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export abstract class SharedLocationInformationRequest<S extends ResultSpec> extends BaseRequest<S> {
  protected static DefaultRestrictionParams(): OJP_Types.LIR_RequestParamsSchema {
    const restrictionParams: OJP_Types.LIR_RequestParamsSchema = {
      type: [],
      numberOfResults: undefined,
      modes: undefined,
      includePtModes: true,
    };

    return restrictionParams;
  }

  protected updateRestrictions(restrictions: OJP_Types.LIR_RequestParamsSchema, placeTypes: OJP_Types.PlaceTypeEnum[], numberOfResults: number) {
    if (placeTypes.length > 0) {
      restrictions.type = placeTypes;
    }

    if (numberOfResults !== null) {
      restrictions.numberOfResults = numberOfResults;
    }
  }

  protected static computeGeoRestriction(bboxData: string | number[]): OJP_Types.GeoRestrictionsSchema | null {
    const bboxDataParts: number[] = (() => {
      if (Array.isArray(bboxData)) {
        return bboxData;
      }

      return (bboxData as string).split(',').map(el => Number(el));
    })();

    if (bboxDataParts.length !== 4) {
      return null;
    }

    const minLongitude = bboxDataParts[0];
    const minLatitude = bboxDataParts[1];
    const maxLongitude = bboxDataParts[2];
    const maxLatitude = bboxDataParts[3];

    const geoRestrictionsSchema: OJP_Types.GeoRestrictionsSchema = {
      rectangle: {
        upperLeft: {
          longitude: minLongitude,
          latitude: maxLatitude,
        },
        lowerRight: {
          longitude: maxLongitude,
          latitude: minLatitude,
        },
      }
    };

    return geoRestrictionsSchema;
  }
}
