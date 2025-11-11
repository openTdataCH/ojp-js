
import { XMLParser } from 'fast-xml-parser';

import * as OJP from '../src'
import { OJP_Helpers } from './helpers/ojp-test.helpers';

import { DefaultXML_Config } from '../src/constants';

describe('OJP Test Request', () => {
  let ojp: OJP.SDK;
  let parser: XMLParser;

  beforeAll(async () => {
    ojp = OJP_Helpers.DefaultSDK();
    parser = new XMLParser();
  });

  test('Test LIR Name', () => {
    const request = ojp.requests.LocationInformationRequest.initWithLocationName('Bern');
    const requestorRef = 'test.requestorRef';
    const requestXML = request.buildRequestXML('de', requestorRef, DefaultXML_Config);

    const requestJSON = parser.parse(requestXML);

    const requestRequestorRef = requestJSON['OJP']['OJPRequest']['siri:ServiceRequest']['siri:RequestorRef'];
    expect(requestRequestorRef).toBe(requestorRef);

    const requestNodeJSON = requestJSON['OJP']['OJPRequest']['siri:ServiceRequest']['OJPLocationInformationRequest'];

    const requestName = requestNodeJSON['InitialInput']['Name'];
    expect(requestName).toBe('Bern');

    const requestNumberOfResults = requestNodeJSON['Restrictions']['NumberOfResults'];
    expect(requestNumberOfResults).toBe(10);
  });

  test('Test LIR PlaceRef', () => {
    const request = ojp.requests.LocationInformationRequest.initWithPlaceRef('8507000');
    const requestorRef = 'test.requestorRef';
    const requestXML = request.buildRequestXML('de', requestorRef, DefaultXML_Config);

    const requestJSON = parser.parse(requestXML);

    const requestRequestorRef = requestJSON['OJP']['OJPRequest']['siri:ServiceRequest']['siri:RequestorRef'];
    expect(requestRequestorRef).toBe(requestorRef);

    const requestNodeJSON = requestJSON['OJP']['OJPRequest']['siri:ServiceRequest']['OJPLocationInformationRequest'];

    const requestStopPlaceRef = requestNodeJSON['PlaceRef']['StopPlaceRef'];
    expect(requestStopPlaceRef).toBe(8507000);
  });

  test('Test LIR BBOX', () => {
    const bbox1 = '7.433259,46.937798,7.475252,46.954805';
    const request = ojp.requests.LocationInformationRequest.initWithBBOX(bbox1, ['stop'], 536);

    const requestorRef = 'test.requestorRef';
    const requestXML = request.buildRequestXML('de', requestorRef, DefaultXML_Config);
    const requestJSON = parser.parse(requestXML);

    const requestRequestorRef = requestJSON['OJP']['OJPRequest']['siri:ServiceRequest']['siri:RequestorRef'];
    expect(requestRequestorRef).toBe(requestorRef);

    const requestNodeJSON = requestJSON['OJP']['OJPRequest']['siri:ServiceRequest']['OJPLocationInformationRequest'];
    
    expect(requestNodeJSON['Restrictions']['Type']).toBe('stop');
    
    const rectangleJSON = requestNodeJSON['InitialInput']['GeoRestriction']['Rectangle'];

    expect(rectangleJSON['UpperLeft']['siri:Longitude']).toBe(7.433259);
    expect(rectangleJSON['LowerRight']['siri:Latitude']).toBe(46.937798);

    // This is equivalent with bbox1
    const bbox2 = [7.433259, 46.937798, 7.475252, 46.954805];
    const request2 = ojp.requests.LocationInformationRequest.initWithBBOX(bbox2, ['stop'], 536);
    const request2_XML = request2.buildRequestXML('de', requestorRef, DefaultXML_Config);
    const request2_JSON = parser.parse(request2_XML);

    const requestNode2_JSON = request2_JSON['OJP']['OJPRequest']['siri:ServiceRequest']['OJPLocationInformationRequest'];
    const rectangle2_JSON = requestNode2_JSON['InitialInput']['GeoRestriction']['Rectangle'];

    expect(rectangle2_JSON['UpperLeft']['siri:Longitude']).toBe(7.433259);
    expect(rectangle2_JSON['LowerRight']['siri:Latitude']).toBe(46.937798);
  });
});
