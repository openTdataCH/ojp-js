// TODO - this should be generated
export const MapNS_Tags: Record<string, string> = {
  'OJPRequest.ServiceRequest': 'siri',
  'ServiceRequest.ServiceRequestContext': 'siri',
  'ServiceRequestContext.Language': 'siri',
  'ServiceRequest.RequestTimestamp': 'siri',
  'ServiceRequest.RequestorRef': 'siri',

  'OJPResponse.ServiceDelivery': 'siri',
  'ServiceDelivery.ResponseTimestamp': 'siri',
  'ServiceDelivery.ProducerRef': 'siri',

  // TripRequest  
  'OJPTripRequest.RequestTimestamp': 'siri',
 
  // TripResponse
  'OJPTripDelivery.ResponseTimestamp': 'siri',
  'OJPTripDelivery.RequestMessageRef': 'siri',
  'OJPTripDelivery.DefaultLanguage': 'siri',

  'LegBoard.StopPointRef': 'siri',
  'LegIntermediate.StopPointRef': 'siri',
  'LegAlight.StopPointRef': 'siri',
  
  'Mode.RailSubmode': 'siri',

  'Service.LineRef': 'siri',
  'Service.OperatorRef': 'siri',
  'Service.DirectionRef': 'siri',

  'TrackSectionStart.StopPointRef': 'siri',
  'TrackSectionEnd.StopPointRef': 'siri',
  
  'Position.Longitude': 'siri',

  'LegStart.StopPointRef': 'siri',
  'LegEnd.StopPointRef': 'siri',

  // LIR Request
  'OJPLocationInformationRequest.RequestTimestamp': 'siri',
  'UpperLeft.Longitude': 'siri',
  'UpperLeft.Latitude': 'siri',
  'LowerRight.Longitude': 'siri',
  'LowerRight.Latitude': 'siri',

  // TR Request
  'GeoPosition.Longitude': 'siri',
  'GeoPosition.Latitude': 'siri',

  // SER Request
  'OJPStopEventRequest.RequestTimestamp': 'siri',
  'PlaceRef.StopPointRef': 'siri',
};

// TODO - this should be generated
// // they are all camelCase because the tags are already transformed in XMLParser.isArrayHandler
export const MapParentArrayTags: Record<string, string[]> = {
  'TripResult.trip': ['leg'],
  'leg.timedLeg': ['legIntermediate'],
  'timedLeg.service': ['attribute'],
  'trackSection.linkProjection': ['position'],

  // LIR Request
  'restrictions.placeParam': ['type'],

  // LIR Response
  'place.pointOfInterest': ['pointOfInterestCategory'],
  'placeResult.place': ['ptMode'],
  'serviceDelivery.OJPLocationInformationDelivery': ['placeResult'],

  // SER Response
  'stopEventResult.stopEvent': ['previousCall', 'onwardCall'],
};
export const MapArrayTags: Record<string, boolean> = {
  'trip.leg': true,
  'timedLeg.legIntermediate': true,
  'service.attribute': true,
  'linkProjection.position': true,

  // LIR Request
  'restrictions.placeParam': true,

  // LIR Response
  'pointOfInterest.pointOfInterestCategory': true,
  'place.ptMode': true,
  'OJPLocationInformationDelivery.placeResult': true,

  // SER Response
  'stopEvent.previousCall': true,
  'stopEvent.onwardCall': true,
};

// TODO - this should be generated
// Declare object properties that are / should be serialised to XML
export const MapModelKeepPropertiesXML: Record<string, string[]> = {
  'OJPLocationInformationRequest': ['requestTimestamp', 'initialInput', 'placeRef', 'restrictions'],
  'OJPTripRequest': ['requestTimestamp', 'origin', 'destination', 'via', 'params'],
  'OJPStopEventRequest': ['requestTimestamp', 'location', 'params'],
  'geoPosition': ['longitude', 'latitude'],
};

// TODO - this should be generated
export const MapStringValues: Record<string, boolean> = {
  'stopPlace.stopPlaceRef': true,
};
