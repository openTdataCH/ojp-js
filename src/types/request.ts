import { OJPv1_LocationInformationRequest } from "../versions/legacy/v1/requests/lir";
import { LocationInformationRequest } from "../versions/current/requests/lir";

import { TripInfoRequest } from "../versions/current/requests/tir";
import { OJPv1_TripInfoRequest } from "../versions/legacy/v1/requests/tir";

import { TripRequest } from "../versions/current/requests/tr";
import { OJPv1_TripRequest } from "../versions/legacy/v1/requests/tr";
export type OJP_RequestType = 
    LocationInformationRequest | OJPv1_LocationInformationRequest |
    TripInfoRequest | OJPv1_TripInfoRequest |
    TripRequest | OJPv1_TripRequest;
