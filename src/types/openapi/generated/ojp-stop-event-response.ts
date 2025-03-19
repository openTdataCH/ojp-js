/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/ojp": {
    /**
     * Main /ojp endpoint 
     * @description Main /ojp endpoint
     */
    post: {
      responses: {
        /** @description Successful response */
        200: {
          content: {
            "application/xml": {
              OJPResponse: {
                serviceDelivery: {
                  responseTimestamp: string;
                  producerRef: string;
                  OJPStopEventDelivery: {
                    responseTimestamp: string;
                    requestMessageRef?: string;
                    defaultLanguage?: string;
                    calcTime?: string;
                    stopEventResponseContext?: {
                      places?: {
                        place: ({
                            stopPoint?: {
                              stopPointRef: string;
                              stopPointName: {
                                text: string;
                              };
                              plannedQuay?: {
                                text: string;
                              };
                              estimatedQuay?: {
                                text: string;
                              };
                            };
                            stopPlace?: {
                              stopPlaceRef?: string;
                              stopPlaceName?: {
                                text: string;
                              };
                            };
                            topographicPlace?: {
                              topographicPlaceCode: string;
                              topographicPlaceName: {
                                text: string;
                              };
                            };
                            pointOfInterest?: {
                              publicCode: string;
                              name: {
                                text: string;
                              };
                              pointOfInterestCategory: ({
                                  osmTag?: {
                                    tag: string;
                                    value: string;
                                  };
                                })[];
                              topographicPlaceRef?: string;
                            };
                            address?: {
                              publicCode: string;
                              name: {
                                text: string;
                              };
                              postCode?: string;
                              topographicPlaceName?: string;
                              TopographicPlaceRef?: string;
                              Street?: string;
                              HouseNumber?: string;
                            };
                            name: {
                              text: string;
                            };
                            geoPosition: {
                              longitude: number;
                              latitude: number;
                            };
                            mode: ("air" | "bus" | "coach" | "trolleyBus" | "metro" | "rail" | "tram" | "water" | "ferry" | "cableway" | "funicular" | "lift" | "other" | "unknown")[];
                          })[];
                      };
                    };
                    stopEventResult: ({
                        id: string;
                        stopEvent: {
                          previousCall: ({
                              callAtStop: {
                                stopPointRef?: string;
                                stopPointName?: {
                                  text: string;
                                };
                                nameSuffix?: {
                                  text: string;
                                };
                                plannedQuay?: {
                                  text: string;
                                };
                                estimatedQuay?: {
                                  text: string;
                                };
                                serviceArrival?: {
                                  timetabledTime: string;
                                  estimatedTime?: string;
                                };
                                serviceDeparture?: {
                                  timetabledTime: string;
                                  estimatedTime?: string;
                                };
                                order?: number;
                                requestStop?: boolean;
                                unplannedStop?: boolean;
                                notServicedStop?: boolean;
                                noBoardingAtStop?: boolean;
                                noAlightingAtStop?: boolean;
                              };
                            })[];
                          thisCall: {
                            callAtStop: {
                              stopPointRef?: string;
                              stopPointName?: {
                                text: string;
                              };
                              nameSuffix?: {
                                text: string;
                              };
                              plannedQuay?: {
                                text: string;
                              };
                              estimatedQuay?: {
                                text: string;
                              };
                              serviceArrival?: {
                                timetabledTime: string;
                                estimatedTime?: string;
                              };
                              serviceDeparture?: {
                                timetabledTime: string;
                                estimatedTime?: string;
                              };
                              order?: number;
                              requestStop?: boolean;
                              unplannedStop?: boolean;
                              notServicedStop?: boolean;
                              noBoardingAtStop?: boolean;
                              noAlightingAtStop?: boolean;
                            };
                          };
                          onwardCall: ({
                              callAtStop: {
                                stopPointRef?: string;
                                stopPointName?: {
                                  text: string;
                                };
                                nameSuffix?: {
                                  text: string;
                                };
                                plannedQuay?: {
                                  text: string;
                                };
                                estimatedQuay?: {
                                  text: string;
                                };
                                serviceArrival?: {
                                  timetabledTime: string;
                                  estimatedTime?: string;
                                };
                                serviceDeparture?: {
                                  timetabledTime: string;
                                  estimatedTime?: string;
                                };
                                order?: number;
                                requestStop?: boolean;
                                unplannedStop?: boolean;
                                notServicedStop?: boolean;
                                noBoardingAtStop?: boolean;
                                noAlightingAtStop?: boolean;
                              };
                            })[];
                          service: {
                            conventionalModeOfOperation?: string;
                            operatingDayRef: string;
                            journeyRef: string;
                            publicCode?: string;
                            lineRef: string;
                            directionRef?: string;
                            mode: {
                              ptMode: string;
                              railSubmode?: string;
                              name: {
                                text: string;
                              };
                              shortName: {
                                text: string;
                              };
                            };
                            productCategory?: {
                              name?: {
                                text: string;
                              };
                              shortName?: {
                                text: string;
                              };
                              productCategoryRef?: string;
                            };
                            publishedServiceName: {
                              text: string;
                            };
                            trainNumber?: string;
                            attribute: ({
                                userText: {
                                  text: string;
                                };
                                code: string;
                              })[];
                            operatorRef?: string;
                            destinationStopPointRef?: string;
                            destinationText?: {
                              text: string;
                            };
                            unplanned?: boolean;
                            cancelled?: boolean;
                            deviation?: boolean;
                          };
                          operatingDays?: {
                            from: string;
                            to: string;
                            pattern: string;
                          };
                        };
                      })[];
                  };
                };
              };
            };
          };
        };
        /** @description Server error */
        500: never;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    PointOfInterestCategory: {
      osmTag?: {
        tag: string;
        value: string;
      };
    };
    StopPoint: {
      stopPointRef: string;
      stopPointName: {
        text: string;
      };
      plannedQuay?: {
        text: string;
      };
      estimatedQuay?: {
        text: string;
      };
    };
    StopPlace: {
      stopPlaceRef?: string;
      stopPlaceName?: {
        text: string;
      };
    };
    TopographicPlace: {
      topographicPlaceCode: string;
      topographicPlaceName: {
        text: string;
      };
    };
    PointOfInterest: {
      publicCode: string;
      name: {
        text: string;
      };
      pointOfInterestCategory: ({
          osmTag?: {
            tag: string;
            value: string;
          };
        })[];
      topographicPlaceRef?: string;
    };
    Address: {
      publicCode: string;
      name: {
        text: string;
      };
      postCode?: string;
      topographicPlaceName?: string;
      TopographicPlaceRef?: string;
      Street?: string;
      HouseNumber?: string;
    };
    Place: {
      stopPoint?: {
        stopPointRef: string;
        stopPointName: {
          text: string;
        };
        plannedQuay?: {
          text: string;
        };
        estimatedQuay?: {
          text: string;
        };
      };
      stopPlace?: {
        stopPlaceRef?: string;
        stopPlaceName?: {
          text: string;
        };
      };
      topographicPlace?: {
        topographicPlaceCode: string;
        topographicPlaceName: {
          text: string;
        };
      };
      pointOfInterest?: {
        publicCode: string;
        name: {
          text: string;
        };
        pointOfInterestCategory: ({
            osmTag?: {
              tag: string;
              value: string;
            };
          })[];
        topographicPlaceRef?: string;
      };
      address?: {
        publicCode: string;
        name: {
          text: string;
        };
        postCode?: string;
        topographicPlaceName?: string;
        TopographicPlaceRef?: string;
        Street?: string;
        HouseNumber?: string;
      };
      name: {
        text: string;
      };
      geoPosition: {
        longitude: number;
        latitude: number;
      };
      mode: ("air" | "bus" | "coach" | "trolleyBus" | "metro" | "rail" | "tram" | "water" | "ferry" | "cableway" | "funicular" | "lift" | "other" | "unknown")[];
    };
    PlaceResult: {
      place: {
        stopPoint?: {
          stopPointRef: string;
          stopPointName: {
            text: string;
          };
          plannedQuay?: {
            text: string;
          };
          estimatedQuay?: {
            text: string;
          };
        };
        stopPlace?: {
          stopPlaceRef?: string;
          stopPlaceName?: {
            text: string;
          };
        };
        topographicPlace?: {
          topographicPlaceCode: string;
          topographicPlaceName: {
            text: string;
          };
        };
        pointOfInterest?: {
          publicCode: string;
          name: {
            text: string;
          };
          pointOfInterestCategory: ({
              osmTag?: {
                tag: string;
                value: string;
              };
            })[];
          topographicPlaceRef?: string;
        };
        address?: {
          publicCode: string;
          name: {
            text: string;
          };
          postCode?: string;
          topographicPlaceName?: string;
          TopographicPlaceRef?: string;
          Street?: string;
          HouseNumber?: string;
        };
        name: {
          text: string;
        };
        geoPosition: {
          longitude: number;
          latitude: number;
        };
        mode: ("air" | "bus" | "coach" | "trolleyBus" | "metro" | "rail" | "tram" | "water" | "ferry" | "cableway" | "funicular" | "lift" | "other" | "unknown")[];
      };
      complete: boolean;
      probability?: number;
    };
    StopEventResponseContext: {
      places?: {
        place: ({
            stopPoint?: {
              stopPointRef: string;
              stopPointName: {
                text: string;
              };
              plannedQuay?: {
                text: string;
              };
              estimatedQuay?: {
                text: string;
              };
            };
            stopPlace?: {
              stopPlaceRef?: string;
              stopPlaceName?: {
                text: string;
              };
            };
            topographicPlace?: {
              topographicPlaceCode: string;
              topographicPlaceName: {
                text: string;
              };
            };
            pointOfInterest?: {
              publicCode: string;
              name: {
                text: string;
              };
              pointOfInterestCategory: ({
                  osmTag?: {
                    tag: string;
                    value: string;
                  };
                })[];
              topographicPlaceRef?: string;
            };
            address?: {
              publicCode: string;
              name: {
                text: string;
              };
              postCode?: string;
              topographicPlaceName?: string;
              TopographicPlaceRef?: string;
              Street?: string;
              HouseNumber?: string;
            };
            name: {
              text: string;
            };
            geoPosition: {
              longitude: number;
              latitude: number;
            };
            mode: ("air" | "bus" | "coach" | "trolleyBus" | "metro" | "rail" | "tram" | "water" | "ferry" | "cableway" | "funicular" | "lift" | "other" | "unknown")[];
          })[];
      };
    };
    CallAtNearStop: {
      callAtStop: {
        stopPointRef?: string;
        stopPointName?: {
          text: string;
        };
        nameSuffix?: {
          text: string;
        };
        plannedQuay?: {
          text: string;
        };
        estimatedQuay?: {
          text: string;
        };
        serviceArrival?: {
          timetabledTime: string;
          estimatedTime?: string;
        };
        serviceDeparture?: {
          timetabledTime: string;
          estimatedTime?: string;
        };
        order?: number;
        requestStop?: boolean;
        unplannedStop?: boolean;
        notServicedStop?: boolean;
        noBoardingAtStop?: boolean;
        noAlightingAtStop?: boolean;
      };
    };
    StopEvent: {
      previousCall: ({
          callAtStop: {
            stopPointRef?: string;
            stopPointName?: {
              text: string;
            };
            nameSuffix?: {
              text: string;
            };
            plannedQuay?: {
              text: string;
            };
            estimatedQuay?: {
              text: string;
            };
            serviceArrival?: {
              timetabledTime: string;
              estimatedTime?: string;
            };
            serviceDeparture?: {
              timetabledTime: string;
              estimatedTime?: string;
            };
            order?: number;
            requestStop?: boolean;
            unplannedStop?: boolean;
            notServicedStop?: boolean;
            noBoardingAtStop?: boolean;
            noAlightingAtStop?: boolean;
          };
        })[];
      thisCall: {
        callAtStop: {
          stopPointRef?: string;
          stopPointName?: {
            text: string;
          };
          nameSuffix?: {
            text: string;
          };
          plannedQuay?: {
            text: string;
          };
          estimatedQuay?: {
            text: string;
          };
          serviceArrival?: {
            timetabledTime: string;
            estimatedTime?: string;
          };
          serviceDeparture?: {
            timetabledTime: string;
            estimatedTime?: string;
          };
          order?: number;
          requestStop?: boolean;
          unplannedStop?: boolean;
          notServicedStop?: boolean;
          noBoardingAtStop?: boolean;
          noAlightingAtStop?: boolean;
        };
      };
      onwardCall: ({
          callAtStop: {
            stopPointRef?: string;
            stopPointName?: {
              text: string;
            };
            nameSuffix?: {
              text: string;
            };
            plannedQuay?: {
              text: string;
            };
            estimatedQuay?: {
              text: string;
            };
            serviceArrival?: {
              timetabledTime: string;
              estimatedTime?: string;
            };
            serviceDeparture?: {
              timetabledTime: string;
              estimatedTime?: string;
            };
            order?: number;
            requestStop?: boolean;
            unplannedStop?: boolean;
            notServicedStop?: boolean;
            noBoardingAtStop?: boolean;
            noAlightingAtStop?: boolean;
          };
        })[];
      service: {
        conventionalModeOfOperation?: string;
        operatingDayRef: string;
        journeyRef: string;
        publicCode?: string;
        lineRef: string;
        directionRef?: string;
        mode: {
          ptMode: string;
          railSubmode?: string;
          name: {
            text: string;
          };
          shortName: {
            text: string;
          };
        };
        productCategory?: {
          name?: {
            text: string;
          };
          shortName?: {
            text: string;
          };
          productCategoryRef?: string;
        };
        publishedServiceName: {
          text: string;
        };
        trainNumber?: string;
        attribute: ({
            userText: {
              text: string;
            };
            code: string;
          })[];
        operatorRef?: string;
        destinationStopPointRef?: string;
        destinationText?: {
          text: string;
        };
        unplanned?: boolean;
        cancelled?: boolean;
        deviation?: boolean;
      };
      operatingDays?: {
        from: string;
        to: string;
        pattern: string;
      };
    };
    StopEventResult: {
      id: string;
      stopEvent: {
        previousCall: ({
            callAtStop: {
              stopPointRef?: string;
              stopPointName?: {
                text: string;
              };
              nameSuffix?: {
                text: string;
              };
              plannedQuay?: {
                text: string;
              };
              estimatedQuay?: {
                text: string;
              };
              serviceArrival?: {
                timetabledTime: string;
                estimatedTime?: string;
              };
              serviceDeparture?: {
                timetabledTime: string;
                estimatedTime?: string;
              };
              order?: number;
              requestStop?: boolean;
              unplannedStop?: boolean;
              notServicedStop?: boolean;
              noBoardingAtStop?: boolean;
              noAlightingAtStop?: boolean;
            };
          })[];
        thisCall: {
          callAtStop: {
            stopPointRef?: string;
            stopPointName?: {
              text: string;
            };
            nameSuffix?: {
              text: string;
            };
            plannedQuay?: {
              text: string;
            };
            estimatedQuay?: {
              text: string;
            };
            serviceArrival?: {
              timetabledTime: string;
              estimatedTime?: string;
            };
            serviceDeparture?: {
              timetabledTime: string;
              estimatedTime?: string;
            };
            order?: number;
            requestStop?: boolean;
            unplannedStop?: boolean;
            notServicedStop?: boolean;
            noBoardingAtStop?: boolean;
            noAlightingAtStop?: boolean;
          };
        };
        onwardCall: ({
            callAtStop: {
              stopPointRef?: string;
              stopPointName?: {
                text: string;
              };
              nameSuffix?: {
                text: string;
              };
              plannedQuay?: {
                text: string;
              };
              estimatedQuay?: {
                text: string;
              };
              serviceArrival?: {
                timetabledTime: string;
                estimatedTime?: string;
              };
              serviceDeparture?: {
                timetabledTime: string;
                estimatedTime?: string;
              };
              order?: number;
              requestStop?: boolean;
              unplannedStop?: boolean;
              notServicedStop?: boolean;
              noBoardingAtStop?: boolean;
              noAlightingAtStop?: boolean;
            };
          })[];
        service: {
          conventionalModeOfOperation?: string;
          operatingDayRef: string;
          journeyRef: string;
          publicCode?: string;
          lineRef: string;
          directionRef?: string;
          mode: {
            ptMode: string;
            railSubmode?: string;
            name: {
              text: string;
            };
            shortName: {
              text: string;
            };
          };
          productCategory?: {
            name?: {
              text: string;
            };
            shortName?: {
              text: string;
            };
            productCategoryRef?: string;
          };
          publishedServiceName: {
            text: string;
          };
          trainNumber?: string;
          attribute: ({
              userText: {
                text: string;
              };
              code: string;
            })[];
          operatorRef?: string;
          destinationStopPointRef?: string;
          destinationText?: {
            text: string;
          };
          unplanned?: boolean;
          cancelled?: boolean;
          deviation?: boolean;
        };
        operatingDays?: {
          from: string;
          to: string;
          pattern: string;
        };
      };
    };
    OJPStopEventDelivery: {
      responseTimestamp: string;
      requestMessageRef?: string;
      defaultLanguage?: string;
      calcTime?: string;
      stopEventResponseContext?: {
        places?: {
          place: ({
              stopPoint?: {
                stopPointRef: string;
                stopPointName: {
                  text: string;
                };
                plannedQuay?: {
                  text: string;
                };
                estimatedQuay?: {
                  text: string;
                };
              };
              stopPlace?: {
                stopPlaceRef?: string;
                stopPlaceName?: {
                  text: string;
                };
              };
              topographicPlace?: {
                topographicPlaceCode: string;
                topographicPlaceName: {
                  text: string;
                };
              };
              pointOfInterest?: {
                publicCode: string;
                name: {
                  text: string;
                };
                pointOfInterestCategory: ({
                    osmTag?: {
                      tag: string;
                      value: string;
                    };
                  })[];
                topographicPlaceRef?: string;
              };
              address?: {
                publicCode: string;
                name: {
                  text: string;
                };
                postCode?: string;
                topographicPlaceName?: string;
                TopographicPlaceRef?: string;
                Street?: string;
                HouseNumber?: string;
              };
              name: {
                text: string;
              };
              geoPosition: {
                longitude: number;
                latitude: number;
              };
              mode: ("air" | "bus" | "coach" | "trolleyBus" | "metro" | "rail" | "tram" | "water" | "ferry" | "cableway" | "funicular" | "lift" | "other" | "unknown")[];
            })[];
        };
      };
      stopEventResult: ({
          id: string;
          stopEvent: {
            previousCall: ({
                callAtStop: {
                  stopPointRef?: string;
                  stopPointName?: {
                    text: string;
                  };
                  nameSuffix?: {
                    text: string;
                  };
                  plannedQuay?: {
                    text: string;
                  };
                  estimatedQuay?: {
                    text: string;
                  };
                  serviceArrival?: {
                    timetabledTime: string;
                    estimatedTime?: string;
                  };
                  serviceDeparture?: {
                    timetabledTime: string;
                    estimatedTime?: string;
                  };
                  order?: number;
                  requestStop?: boolean;
                  unplannedStop?: boolean;
                  notServicedStop?: boolean;
                  noBoardingAtStop?: boolean;
                  noAlightingAtStop?: boolean;
                };
              })[];
            thisCall: {
              callAtStop: {
                stopPointRef?: string;
                stopPointName?: {
                  text: string;
                };
                nameSuffix?: {
                  text: string;
                };
                plannedQuay?: {
                  text: string;
                };
                estimatedQuay?: {
                  text: string;
                };
                serviceArrival?: {
                  timetabledTime: string;
                  estimatedTime?: string;
                };
                serviceDeparture?: {
                  timetabledTime: string;
                  estimatedTime?: string;
                };
                order?: number;
                requestStop?: boolean;
                unplannedStop?: boolean;
                notServicedStop?: boolean;
                noBoardingAtStop?: boolean;
                noAlightingAtStop?: boolean;
              };
            };
            onwardCall: ({
                callAtStop: {
                  stopPointRef?: string;
                  stopPointName?: {
                    text: string;
                  };
                  nameSuffix?: {
                    text: string;
                  };
                  plannedQuay?: {
                    text: string;
                  };
                  estimatedQuay?: {
                    text: string;
                  };
                  serviceArrival?: {
                    timetabledTime: string;
                    estimatedTime?: string;
                  };
                  serviceDeparture?: {
                    timetabledTime: string;
                    estimatedTime?: string;
                  };
                  order?: number;
                  requestStop?: boolean;
                  unplannedStop?: boolean;
                  notServicedStop?: boolean;
                  noBoardingAtStop?: boolean;
                  noAlightingAtStop?: boolean;
                };
              })[];
            service: {
              conventionalModeOfOperation?: string;
              operatingDayRef: string;
              journeyRef: string;
              publicCode?: string;
              lineRef: string;
              directionRef?: string;
              mode: {
                ptMode: string;
                railSubmode?: string;
                name: {
                  text: string;
                };
                shortName: {
                  text: string;
                };
              };
              productCategory?: {
                name?: {
                  text: string;
                };
                shortName?: {
                  text: string;
                };
                productCategoryRef?: string;
              };
              publishedServiceName: {
                text: string;
              };
              trainNumber?: string;
              attribute: ({
                  userText: {
                    text: string;
                  };
                  code: string;
                })[];
              operatorRef?: string;
              destinationStopPointRef?: string;
              destinationText?: {
                text: string;
              };
              unplanned?: boolean;
              cancelled?: boolean;
              deviation?: boolean;
            };
            operatingDays?: {
              from: string;
              to: string;
              pattern: string;
            };
          };
        })[];
    };
    OJP: {
      OJPResponse: {
        serviceDelivery: {
          responseTimestamp: string;
          producerRef: string;
          OJPStopEventDelivery: {
            responseTimestamp: string;
            requestMessageRef?: string;
            defaultLanguage?: string;
            calcTime?: string;
            stopEventResponseContext?: {
              places?: {
                place: ({
                    stopPoint?: {
                      stopPointRef: string;
                      stopPointName: {
                        text: string;
                      };
                      plannedQuay?: {
                        text: string;
                      };
                      estimatedQuay?: {
                        text: string;
                      };
                    };
                    stopPlace?: {
                      stopPlaceRef?: string;
                      stopPlaceName?: {
                        text: string;
                      };
                    };
                    topographicPlace?: {
                      topographicPlaceCode: string;
                      topographicPlaceName: {
                        text: string;
                      };
                    };
                    pointOfInterest?: {
                      publicCode: string;
                      name: {
                        text: string;
                      };
                      pointOfInterestCategory: ({
                          osmTag?: {
                            tag: string;
                            value: string;
                          };
                        })[];
                      topographicPlaceRef?: string;
                    };
                    address?: {
                      publicCode: string;
                      name: {
                        text: string;
                      };
                      postCode?: string;
                      topographicPlaceName?: string;
                      TopographicPlaceRef?: string;
                      Street?: string;
                      HouseNumber?: string;
                    };
                    name: {
                      text: string;
                    };
                    geoPosition: {
                      longitude: number;
                      latitude: number;
                    };
                    mode: ("air" | "bus" | "coach" | "trolleyBus" | "metro" | "rail" | "tram" | "water" | "ferry" | "cableway" | "funicular" | "lift" | "other" | "unknown")[];
                  })[];
              };
            };
            stopEventResult: ({
                id: string;
                stopEvent: {
                  previousCall: ({
                      callAtStop: {
                        stopPointRef?: string;
                        stopPointName?: {
                          text: string;
                        };
                        nameSuffix?: {
                          text: string;
                        };
                        plannedQuay?: {
                          text: string;
                        };
                        estimatedQuay?: {
                          text: string;
                        };
                        serviceArrival?: {
                          timetabledTime: string;
                          estimatedTime?: string;
                        };
                        serviceDeparture?: {
                          timetabledTime: string;
                          estimatedTime?: string;
                        };
                        order?: number;
                        requestStop?: boolean;
                        unplannedStop?: boolean;
                        notServicedStop?: boolean;
                        noBoardingAtStop?: boolean;
                        noAlightingAtStop?: boolean;
                      };
                    })[];
                  thisCall: {
                    callAtStop: {
                      stopPointRef?: string;
                      stopPointName?: {
                        text: string;
                      };
                      nameSuffix?: {
                        text: string;
                      };
                      plannedQuay?: {
                        text: string;
                      };
                      estimatedQuay?: {
                        text: string;
                      };
                      serviceArrival?: {
                        timetabledTime: string;
                        estimatedTime?: string;
                      };
                      serviceDeparture?: {
                        timetabledTime: string;
                        estimatedTime?: string;
                      };
                      order?: number;
                      requestStop?: boolean;
                      unplannedStop?: boolean;
                      notServicedStop?: boolean;
                      noBoardingAtStop?: boolean;
                      noAlightingAtStop?: boolean;
                    };
                  };
                  onwardCall: ({
                      callAtStop: {
                        stopPointRef?: string;
                        stopPointName?: {
                          text: string;
                        };
                        nameSuffix?: {
                          text: string;
                        };
                        plannedQuay?: {
                          text: string;
                        };
                        estimatedQuay?: {
                          text: string;
                        };
                        serviceArrival?: {
                          timetabledTime: string;
                          estimatedTime?: string;
                        };
                        serviceDeparture?: {
                          timetabledTime: string;
                          estimatedTime?: string;
                        };
                        order?: number;
                        requestStop?: boolean;
                        unplannedStop?: boolean;
                        notServicedStop?: boolean;
                        noBoardingAtStop?: boolean;
                        noAlightingAtStop?: boolean;
                      };
                    })[];
                  service: {
                    conventionalModeOfOperation?: string;
                    operatingDayRef: string;
                    journeyRef: string;
                    publicCode?: string;
                    lineRef: string;
                    directionRef?: string;
                    mode: {
                      ptMode: string;
                      railSubmode?: string;
                      name: {
                        text: string;
                      };
                      shortName: {
                        text: string;
                      };
                    };
                    productCategory?: {
                      name?: {
                        text: string;
                      };
                      shortName?: {
                        text: string;
                      };
                      productCategoryRef?: string;
                    };
                    publishedServiceName: {
                      text: string;
                    };
                    trainNumber?: string;
                    attribute: ({
                        userText: {
                          text: string;
                        };
                        code: string;
                      })[];
                    operatorRef?: string;
                    destinationStopPointRef?: string;
                    destinationText?: {
                      text: string;
                    };
                    unplanned?: boolean;
                    cancelled?: boolean;
                    deviation?: boolean;
                  };
                  operatingDays?: {
                    from: string;
                    to: string;
                    pattern: string;
                  };
                };
              })[];
          };
        };
      };
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export type operations = Record<string, never>;
