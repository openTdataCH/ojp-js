export class JourneyRequestParams {
    constructor(tripLocations, tripModeTypes, transportModes, depArrDate, dateType) {
        this.tripLocations = tripLocations;
        this.tripModeTypes = tripModeTypes;
        this.transportModes = transportModes;
        this.depArrDate = depArrDate;
        this.dateType = dateType !== null && dateType !== void 0 ? dateType : 'Departure';
        this.includeLegProjection = true;
        this.useNumberOfResultsAfter = true;
    }
    static initWithLocationsAndDate(fromTripLocation, toTripLocation, viaTripLocations, tripModeTypes, transportModes, depArrDate, dateType) {
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
        const requestParams = new JourneyRequestParams(tripLocations, tripModeTypes, transportModes, depArrDate, dateType);
        return requestParams;
    }
}
