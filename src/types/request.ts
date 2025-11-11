import { LocationInformationRequest } from "../versions/current/requests/lir";
import { OJPv1_LocationInformationRequest } from "../versions/legacy/v1/requests/lir";

import { TripInfoRequest } from "../versions/current/requests/tir";
import { OJPv1_TripInfoRequest } from "../versions/legacy/v1/requests/tir";

import { StopEventRequest } from "../versions/current/requests/ser";
import { OJPv1_StopEventRequest } from "../versions/legacy/v1/requests/ser";

import { TripRefineRequest } from "../versions/current/requests/trr";

import { TripRequest } from "../versions/current/requests/tr";
import { OJPv1_TripRequest } from "../versions/legacy/v1/requests/tr";

export type OJP_RequestType = 
    LocationInformationRequest | OJPv1_LocationInformationRequest |
    StopEventRequest | OJPv1_StopEventRequest |
    TripInfoRequest | OJPv1_TripInfoRequest |
    TripRefineRequest |
    TripRequest | OJPv1_TripRequest;
