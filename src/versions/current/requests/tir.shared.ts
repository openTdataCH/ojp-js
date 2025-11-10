import * as OJP_Types from 'ojp-shared-types';

import { Language, OJP_VERSION, XML_Config } from '../../../types/_all';
import { RequestHelpers } from '../../../helpers/request-helpers';

import { SDK } from '../../../sdk';
import { BaseRequest } from "./base";

type ResultSpec = { version: OJP_VERSION, fetchResponse: unknown };

export abstract class SharedTripInfoRequest<S extends ResultSpec> extends BaseRequest {
  public payload: OJP_Types.TIR_RequestSchema;

  protected constructor(journeyRef: string, operatingDayRef: string, params?: OJP_Types.TIR_RequestParamsSchema) {
    super();

    this.payload = {
      requestTimestamp: RequestHelpers.computeRequestTimestamp(),
      journeyRef: journeyRef,
      operatingDayRef: operatingDayRef,
      params: params,
    };
  }

  protected static DefaultRequestParams() {
    const params: OJP_Types.TIR_RequestParamsSchema = {
      includeCalls: true,
      includeService: true,
      includeTrackProjection: false,
      includePlacesContext: true,
      includeSituationsContext: true,
    };

    return params;
  }

  protected abstract _fetchResponse(sdk: SDK<S['version']>): Promise<S['fetchResponse']>;
  public async fetchResponse(sdk: SDK<S['version']>): Promise<S['fetchResponse']> {
    const response = await this._fetchResponse(sdk);
    return response;
  }

  protected abstract patchPayload(): void;

  public abstract buildRequestXML(language: Language, requestorRef: string, xmlConfig: XML_Config): string;
}
