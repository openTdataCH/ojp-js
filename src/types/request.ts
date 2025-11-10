import { OJPv1_LocationInformationRequest } from "../versions/legacy/v1/requests/lir";
import { LocationInformationRequest } from "../versions/current/requests/lir";
import { TripInfoRequest } from "../versions/current/requests/tir";
import { OJPv1_TripInfoRequest } from "../versions/legacy/v1/requests/tir";

export type OJP_LocationInformationRequestType = LocationInformationRequest | OJPv1_LocationInformationRequest
export type OJP_TripInfoRequestType = TripInfoRequest | OJPv1_TripInfoRequest;
export type OJP_RequestType = OJP_LocationInformationRequestType | OJP_TripInfoRequestType;
