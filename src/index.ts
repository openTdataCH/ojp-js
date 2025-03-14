// These exports - ./types/openapi - should be kept at minimum as possible
export { 
  TimedLegSchema as TimedLeg, 
  TransferLegSchema as TransferLeg, 
  ContinuousLegSchema as ContinuousLeg,
} from './types/openapi';

export {
  TripRequest,
  LocationInformationRequest,

  PlaceResult,
} from "./models/ojp";

export { HTTPConfig } from "./types/_all";

export { SDK } from "./sdk";
