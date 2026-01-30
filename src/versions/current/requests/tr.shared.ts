import * as OJP_Types from 'ojp-shared-types';

import { BaseRequest, ResultSpec } from "./base";

export abstract class SharedTripRequest<S extends ResultSpec> extends BaseRequest<S> {
}
