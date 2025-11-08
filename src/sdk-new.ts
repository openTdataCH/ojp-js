import { LocationInformationRequest } from './versions/v2/requests/lir';
import { OJPv1_LocationInformationRequest } from './versions/legacy/v1/requests/lir';

type Version = 'v1' | 'v2';

type LocationInformationRequestClass<V extends Version> =
  V extends 'v2' ? typeof LocationInformationRequest : typeof OJPv1_LocationInformationRequest;

export class SDK<V extends Version = 'v2'> {
  private readonly version: V;

  constructor(version?: V) {
    this.version = (version ?? 'v2') as V;
  }

  public get LocationInformationRequest(): LocationInformationRequestClass<V> {
    return (this.version === 'v2' ? LocationInformationRequest : OJPv1_LocationInformationRequest) as LocationInformationRequestClass<V>;
  }
}
