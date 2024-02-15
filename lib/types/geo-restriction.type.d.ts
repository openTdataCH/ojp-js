export type GeoRestrictionType = 'stop' | 'address' | 'poi_amenity' | 'poi_all' | 'coord' | 'topographicPlace';
type PoiOSMTagAmenity = 'escooter_rental' | 'car_sharing' | 'bicycle_rental' | 'charging_station';
type PoiOSMTagPOI = 'service' | 'shopping' | 'leisure' | 'catering' | 'public' | 'parkride' | 'accommodation' | 'sbb_services' | 'other';
export type GeoRestrictionPoiOSMTag = PoiOSMTagAmenity | PoiOSMTagPOI;
export {};
