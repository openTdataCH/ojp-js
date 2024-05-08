type DefaultIndividualTransportMode = 'public_transport' | 'walk' | 'cycle';
type SharedIndividualTransportMode = 'escooter_rental' | 'car_sharing' | 'self-drive-car' | 'bicycle_rental';
export type IndividualTransportMode = DefaultIndividualTransportMode | SharedIndividualTransportMode | 'charging_station' | 'taxi' | 'others-drive-car' | 'car-shuttle-train';
export {};
