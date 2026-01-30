import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export type EndpointType = 'origin' | 'destination' | 'both';

export abstract class SharedTripRequest<S extends ResultSpec> extends BaseRequest<S> {
}
