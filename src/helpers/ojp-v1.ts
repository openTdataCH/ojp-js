import * as OJP_Types from 'ojp-shared-types';

export class OJPv1_Helpers {
  public static convertOJPv2Trip_to_v1Trip(tripV2: OJP_Types.TripSchema): OJP_Types.OJPv1_TripSchema {
    const tripV2Copy = JSON.parse(JSON.stringify(tripV2)) as OJP_Types.TripSchema;

    const trip1: OJP_Types.OJPv1_TripSchema = {
      tripId: tripV2Copy.id,
      duration: tripV2Copy.duration,
      startTime: tripV2Copy.startTime,
      endTime: tripV2Copy.endTime,
      transfers: tripV2Copy.transfers,
      tripLeg: [],
    };

    tripV2Copy.leg.forEach(legV2 => {
      const legV1: OJP_Types.OJPv1_TripLegSchema = {
        legId: legV2.id,
        duration: legV2.duration,
        timedLeg: undefined,
        transferLeg: legV2.transferLeg,
        continuousLeg: legV2.continuousLeg,
      };

      if (legV2.timedLeg) {
        const timedLegServiceV1: OJP_Types.OJPv1_DatedJourneySchema = {
          conventionalModeOfOperation: legV2.timedLeg.service.conventionalModeOfOperation,
          operatingDayRef: legV2.timedLeg.service.operatingDayRef,
          journeyRef: legV2.timedLeg.service.journeyRef,
          publicCode: legV2.timedLeg.service.publicCode,
          lineRef: legV2.timedLeg.service.lineRef,
          directionRef: legV2.timedLeg.service.directionRef,
          mode: legV2.timedLeg.service.mode,
          productCategory: legV2.timedLeg.service.productCategory,
          publishedLineName: legV2.timedLeg.service.publishedServiceName,
          trainNumber: legV2.timedLeg.service.trainNumber,
          attribute: [],
          operatorRef: legV2.timedLeg.service.operatorRef,
          destinationStopPointRef: legV2.timedLeg.service.destinationStopPointRef,
          destinationText: legV2.timedLeg.service.destinationText,
          unplanned: legV2.timedLeg.service.unplanned,
          cancelled: legV2.timedLeg.service.cancelled,
          deviation: legV2.timedLeg.service.deviation,
        };

        legV2.timedLeg.service.attribute.forEach(attributeV2 => {
          const attributeV1: OJP_Types.OJPv1_GeneralAttributeSchema = {
            text: attributeV2.userText,
            code: attributeV2.code,
            importance: attributeV2.importance,
          };
          timedLegServiceV1.attribute.push(attributeV1);
        });
        
        const timedLegV1: OJP_Types.OJPv1_TimedLegSchema = {
          legBoard: legV2.timedLeg.legBoard,
          legIntermediates: legV2.timedLeg.legIntermediate,
          legAlight: legV2.timedLeg.legAlight,
          service: timedLegServiceV1,
          legTrack: legV2.timedLeg.legTrack,
        };
        legV1.timedLeg = timedLegV1;
      }

      trip1.tripLeg.push(legV1);
    });

    return trip1;
  }

  // Keep minimum required nodes needed for nova service, strip everything else
  public static cleanTripForFareRequest(trip: OJP_Types.OJPv1_TripSchema) {
    trip.tripLeg.forEach(leg => {
      if (leg.continuousLeg) {
        leg.continuousLeg = {
          legStart: {
            name: leg.continuousLeg.legStart.name,
          },
          legEnd: {
            name: leg.continuousLeg.legEnd.name,
          },
          service: {
            personalMode: 'foot',
            personalModeOfOperation: 'own',
          },
          duration: leg.continuousLeg.duration,
        };
      }

      if (leg.transferLeg) {
        leg.transferLeg = {
          transferType: leg.transferLeg.transferType,
          legStart: {
            name: leg.transferLeg.legStart.name,
          },
          legEnd: {
            name: leg.transferLeg.legEnd.name,
          },
          duration: leg.transferLeg.duration,
        };
      }

      if (leg.timedLeg) {
        const newLegIntermediates = leg.timedLeg.legIntermediates.map(el => {
          const newLeg = {
            stopPointRef: el.stopPointRef,
            stopPointName: el.stopPointName,
            serviceArrival: el.serviceArrival,
            serviceDeparture: el.serviceDeparture,
          };
          
          return newLeg;
        });

        leg.timedLeg = {
          legBoard: {
            stopPointRef: leg.timedLeg.legBoard.stopPointRef,
            stopPointName: leg.timedLeg.legBoard.stopPointName,
            serviceDeparture: leg.timedLeg.legBoard.serviceDeparture,
          },
          legIntermediates: newLegIntermediates,
          legAlight: {
            stopPointRef: leg.timedLeg.legAlight.stopPointRef,
            stopPointName: leg.timedLeg.legAlight.stopPointName,
            serviceArrival: leg.timedLeg.legAlight.serviceArrival,
          },
          service: {
            operatingDayRef: leg.timedLeg.service.operatingDayRef,
            journeyRef: leg.timedLeg.service.journeyRef,
            lineRef: leg.timedLeg.service.lineRef,
            directionRef: leg.timedLeg.service.directionRef,
            mode: leg.timedLeg.service.mode,
            publishedLineName: leg.timedLeg.service.publishedLineName,
            attribute: leg.timedLeg.service.attribute,
            operatorRef: leg.timedLeg.service.operatorRef,
          },
        };
      }
    });
  }
}
