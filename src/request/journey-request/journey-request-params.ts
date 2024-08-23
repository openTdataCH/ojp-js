import { TripLocationPoint } from "../../trip";
import { IndividualTransportMode } from "../../types/individual-mode.types";
import { Language } from "../../types/language-type";
import { TripModeType } from "../../types/trip-mode-type";
import { TripRequestBoardingType } from '../trips-request/trips-request'
import { NumberOfResultsType } from "../types/trip-request.type";

export class JourneyRequestParams {
  tripLocations: TripLocationPoint[]
  tripModeTypes: TripModeType[]
  transportModes: IndividualTransportMode[]
  departureDate: Date
  includeLegProjection: boolean
  public tripRequestBoardingType: TripRequestBoardingType
  numberOfResultsType: NumberOfResultsType
  language: Language

  constructor(
    language: Language,
    tripLocations: TripLocationPoint[], 
    tripModeTypes: TripModeType[], 
    transportModes: IndividualTransportMode[], 
    departureDate: Date, 
    tripRequestBoardingType: TripRequestBoardingType,
    numberOfResultsType: NumberOfResultsType,
  ) {
    this.tripLocations = tripLocations;
    this.tripModeTypes = tripModeTypes
    this.transportModes = transportModes
    this.departureDate = departureDate
    this.includeLegProjection = true
    this.tripRequestBoardingType = tripRequestBoardingType
    this.numberOfResultsType = numberOfResultsType
    this.language = language
  } 

  public static initWithLocationsAndDate(
    language: Language,
    fromTripLocation: TripLocationPoint | null,
    toTripLocation: TripLocationPoint | null,
    viaTripLocations: TripLocationPoint[],
    tripModeTypes: TripModeType[],
    transportModes: IndividualTransportMode[],
    departureDate: Date,
    tripRequestBoardingType: TripRequestBoardingType,
    numberOfResultsType: NumberOfResultsType,
  ): JourneyRequestParams | null {
    if ((fromTripLocation === null) || (toTripLocation === null)) {
      return null;
    }

    // Both locations should have a geoPosition OR stopPlace
    if (!((fromTripLocation.location.geoPosition || fromTripLocation.location.stopPlace) && (toTripLocation.location.geoPosition || toTripLocation.location.stopPlace))) {
      console.error('JourneyRequestParams.initWithLocationsAndDate - broken from, to')
      console.log(fromTripLocation)
      console.log(toTripLocation)
      return null;
    }

    // Via locations should have a geoPosition
    let hasBrokenVia = false
    viaTripLocations.forEach(tripLocation => {
      if (tripLocation.location.geoPosition === null) {
        hasBrokenVia = true
      }
    })
    if (hasBrokenVia) {
      console.error('JourneyRequestParams.initWithLocationsAndDate - broken via')
      console.log(viaTripLocations)
      return null;
    }

    if ((viaTripLocations.length + 1) !== tripModeTypes.length) {
      console.error('JourneyRequestParams.initWithLocationsAndDate - wrong via/mot types')
      console.log(viaTripLocations)
      console.log(tripModeTypes)
      return null;
    }

    let tripLocations: TripLocationPoint[] = [];
    tripLocations.push(fromTripLocation)
    tripLocations = tripLocations.concat(viaTripLocations);
    tripLocations.push(toTripLocation);

    const requestParams = new JourneyRequestParams(
      language,
      tripLocations, 
      tripModeTypes, 
      transportModes, 
      departureDate, 
      tripRequestBoardingType, 
      numberOfResultsType, 
    )

    return requestParams
  }
}
