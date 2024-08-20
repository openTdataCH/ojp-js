import { DataHelpers } from '../../helpers/data-helpers';
import { TripLegPropertiesEnum } from '../../types/map-geometry-types';
import { MapLegTypeColor } from '../../config/map-colors';
import { GeoPositionBBOX } from '../../location/geoposition-bbox';
export class TripLeg {
    constructor(legType, legIDx, fromLocation, toLocation) {
        this.legType = legType;
        this.legID = legIDx;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.legTrack = null;
        this.legDuration = null;
    }
    patchLocations(mapContextLocations) {
        [this.fromLocation, this.toLocation].forEach(location => {
            var _a;
            this.patchLocation(location, mapContextLocations);
            if (location.geoPosition) {
                return;
            }
            if ((_a = this.legTrack) === null || _a === void 0 ? void 0 : _a.hasGeoData) {
                const isFrom = location === this.fromLocation;
                if (isFrom) {
                    this.fromLocation.geoPosition = this.legTrack.fromGeoPosition();
                }
                else {
                    this.toLocation.geoPosition = this.legTrack.toGeoPosition();
                }
            }
        });
    }
    patchSituations(mapContextSituations) {
        // override
    }
    patchLocation(location, mapContextLocations) {
        var _a, _b;
        if (location.geoPosition) {
            return;
        }
        let stopRef = (_b = (_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
        if (stopRef === null) {
            console.error('TripLeg.patchLocation - no stopPlaceRef found in location');
            console.log(location);
            return;
        }
        if (!(stopRef in mapContextLocations)) {
            // For StopPoint try to get the StopPlace
            // see https://github.com/openTdataCH/ojp-sdk/issues/97
            stopRef = DataHelpers.convertStopPointToStopPlace(stopRef);
        }
        if (!(stopRef in mapContextLocations)) {
            console.error('TripLeg.patchLocation - no stopPlaceRef found in mapContextLocations');
            console.log(location);
            console.log('location.stopPlace?.stopPlaceRef :' + stopRef);
            console.log(mapContextLocations);
            return;
        }
        const contextLocation = mapContextLocations[stopRef];
        location.patchWithAnotherLocation(contextLocation);
    }
    computeGeoJSONFeatures() {
        let features = [];
        const useBeeline = this.useBeeline();
        if (useBeeline) {
            const beelineFeature = this.computeBeelineFeature();
            if (beelineFeature) {
                features.push(beelineFeature);
            }
        }
        const linePointFeatures = this.computeLinePointFeatures();
        features = features.concat(linePointFeatures);
        features = features.concat(this.computeSpecificJSONFeatures());
        features.forEach(feature => {
            if (feature.properties) {
                if (feature.properties[TripLegPropertiesEnum.DrawType] === null) {
                    debugger;
                }
                feature.properties['leg.idx'] = this.legID - 1;
                feature.properties[TripLegPropertiesEnum.LegType] = this.computeLegType();
            }
        });
        return features;
    }
    useBeeline() {
        var _a;
        if ((_a = this.legTrack) === null || _a === void 0 ? void 0 : _a.hasGeoData) {
            return false;
        }
        return true;
    }
    computeLegType() {
        if (this.legType == 'TimedLeg') {
            return 'TimedLeg';
        }
        if (this.legType == 'TransferLeg') {
            return 'TransferLeg';
        }
        if (this.legType == 'ContinousLeg') {
            return 'ContinousLeg';
        }
        debugger;
        return 'n/a';
    }
    computeSpecificJSONFeatures() {
        return [];
    }
    computeLegColor() {
        var _a;
        const color = (_a = MapLegTypeColor[this.legType]) !== null && _a !== void 0 ? _a : MapLegTypeColor.TimedLeg;
        return color;
    }
    computeLinePointsData() {
        const linePointsData = [];
        const locations = [this.fromLocation, this.toLocation];
        locations.forEach(location => {
            var _a, _b;
            const locationFeature = location.asGeoJSONFeature();
            if (locationFeature === null || locationFeature === void 0 ? void 0 : locationFeature.properties) {
                const isFrom = location === this.fromLocation;
                const stopPointType = isFrom ? 'From' : 'To';
                // Extend the endpoints to the LegTrack if available
                const pointGeoPosition = isFrom ? (_a = this.legTrack) === null || _a === void 0 ? void 0 : _a.fromGeoPosition() : (_b = this.legTrack) === null || _b === void 0 ? void 0 : _b.toGeoPosition();
                if (pointGeoPosition) {
                    locationFeature.geometry.coordinates = pointGeoPosition.asPosition();
                }
                linePointsData.push({
                    type: stopPointType,
                    feature: locationFeature
                });
            }
        });
        return linePointsData;
    }
    computeLinePointFeatures() {
        const features = [];
        const lineType = this.computeLegLineType();
        const linePointsData = this.computeLinePointsData();
        // Add more attributes
        linePointsData.forEach(pointData => {
            const stopPointType = pointData.type;
            const feature = pointData.feature;
            if (feature.properties === null) {
                return;
            }
            feature.properties[TripLegPropertiesEnum.PointType] = stopPointType;
            const drawType = 'LegPoint';
            feature.properties[TripLegPropertiesEnum.DrawType] = drawType;
            feature.properties[TripLegPropertiesEnum.LineType] = lineType;
            feature.bbox = [
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
            ];
            features.push(feature);
        });
        return features;
    }
    computeLegLineType() {
        return 'Unknown';
    }
    computeBeelineFeature() {
        const beelineGeoPositions = this.computeBeelineGeoPositions();
        if (beelineGeoPositions.length < 2) {
            return null;
        }
        const coordinates = [];
        beelineGeoPositions.forEach(geoPosition => {
            coordinates.push(geoPosition.asPosition());
        });
        const beelineProperties = {};
        const drawType = 'Beeline';
        beelineProperties[TripLegPropertiesEnum.DrawType] = drawType;
        const lineType = this.computeLegLineType();
        beelineProperties[TripLegPropertiesEnum.LineType] = lineType;
        const bbox = new GeoPositionBBOX(beelineGeoPositions);
        const beelineFeature = {
            type: 'Feature',
            properties: beelineProperties,
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            bbox: bbox.asFeatureBBOX()
        };
        return beelineFeature;
    }
    computeBeelineGeoPositions() {
        const geoPositions = [];
        const locations = [this.fromLocation, this.toLocation];
        locations.forEach(location => {
            if (location.geoPosition) {
                geoPositions.push(location.geoPosition);
            }
        });
        return geoPositions;
    }
}
