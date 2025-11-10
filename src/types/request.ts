import { OJPv1_LocationInformationRequest } from "../versions/legacy/v1/requests/lir";
import { LocationInformationRequest } from "../versions/current/requests/lir";

export type OJP_LocationInformationRequestType = LocationInformationRequest | OJPv1_LocationInformationRequest
export type OJP_RequestType = OJP_LocationInformationRequestType;
