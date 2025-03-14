// These exports - ./types/openapi - should be kept at minimum as possible
export { 
  TimedLegSchema as TimedLeg, 
  TransferLegSchema as TransferLeg, 
  ContinuousLegSchema as ContinuousLeg,
} from './types/openapi';

export {
  TripRequest,
  LocationInformationRequest,
} from "./models/sdk";

export { HTTPConfig } from "./types/_all";

export { SDK } from "./ojp";
