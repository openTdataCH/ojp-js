export type UseRealtimeDataEnumeration = 'full' | 'explanatory' | 'none';

export type FareClassType = 'firstClass' | 'secondClass';
export type OccupancyLevel = 'unknown' | 'manySeatsAvailable' | 'fewSeatsAvailable' | 'standingRoomOnly';

export interface XML_Config {
  ojpVersion: '1.0' | '2.0',
  defaultNS: 'ojp' | 'siri' | null,
  mapNS: Record<string, string>
}
