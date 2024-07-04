export class JourneyRequestParams {
    constructor(tripLocations, tripModeTypes, transportModes, departureDate, tripRequestBoardingType, numberOfResultsType) {
        this.tripLocations = tripLocations;
        this.tripModeTypes = tripModeTypes;
        this.transportModes = transportModes;
        this.departureDate = departureDate;
        this.includeLegProjection = true;
        this.tripRequestBoardingType = tripRequestBoardingType;
        this.numberOfResultsType = numberOfResultsType;
    }
    static initWithLocationsAndDate(fromTripLocation, toTripLocation, viaTripLocations, tripModeTypes, transportModes, departureDate, tripRequestBoardingType, numberOfResultsType) {
        if ((fromTripLocation === null) || (toTripLocation === null)) {
            return null;
        }
        // Both locations should have a geoPosition OR stopPlace
        if (!((fromTripLocation.location.geoPosition || fromTripLocation.location.stopPlace) && (toTripLocation.location.geoPosition || toTripLocation.location.stopPlace))) {
            console.error('JourneyRequestParams.initWithLocationsAndDate - broken from, to');
            console.log(fromTripLocation);
            console.log(toTripLocation);
            return null;
        }
        // Via locations should have a geoPosition
        let hasBrokenVia = false;
        viaTripLocations.forEach(tripLocation => {
            if (tripLocation.location.geoPosition === null) {
                hasBrokenVia = true;
            }
        });
        if (hasBrokenVia) {
            console.error('JourneyRequestParams.initWithLocationsAndDate - broken via');
            console.log(viaTripLocations);
            return null;
        }
        if ((viaTripLocations.length + 1) !== tripModeTypes.length) {
            console.error('JourneyRequestParams.initWithLocationsAndDate - wrong via/mot types');
            console.log(viaTripLocations);
            console.log(tripModeTypes);
            return null;
        }
        let tripLocations = [];
        tripLocations.push(fromTripLocation);
        tripLocations = tripLocations.concat(viaTripLocations);
        tripLocations.push(toTripLocation);
        const requestParams = new JourneyRequestParams(tripLocations, tripModeTypes, transportModes, departureDate, tripRequestBoardingType, numberOfResultsType);
        return requestParams;
    }
}
