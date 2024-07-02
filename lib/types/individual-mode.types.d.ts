type DefaultIndividualTransportMode = 'public_transport' | 'walk' | 'cycle' | 'car';
type SharedIndividualTransportMode = 'escooter_rental' | 'car_sharing' | 'self-drive-car' | 'bicycle_rental';
type OtherTransportMode = 'charging_station' | 'taxi' | 'others-drive-car' | 'car-shuttle-train' | 'car-ferry';
export type IndividualTransportMode = DefaultIndividualTransportMode | SharedIndividualTransportMode | OtherTransportMode;
export type TransferMode = 'walk' | 'remainInVehicle';
export {};
