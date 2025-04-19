import { Location } from '../../location/location';
import { PathGuidance } from '../path-guidance';
import { LegTrack } from './leg-track';
import { TripLeg } from "./trip-leg";
import { Duration } from '../../shared/duration';
import { ServiceBooking } from './continous-leg/service-booking';
import { OJP_VERSION } from '../../constants';
export class TripContinuousLeg extends TripLeg {
    constructor(legType, legIDx, legDistance, fromLocation, toLocation) {
        super(legType, legIDx, fromLocation, toLocation);
        this.legTransportMode = null;
        this.legDistance = legDistance;
        this.pathGuidance = null;
        this.walkDuration = null;
        this.serviceBooking = null;
        this.transferMode = null;
        this.continousLegService = null;
    }
    static initWithTreeNode(legIDx, parentTreeNode, legType) {
        var _a, _b, _c;
        const treeNode = parentTreeNode.findChildNamed(legType);
        if (treeNode === null) {
            return null;
        }
        const legStartPlaceRefTreeNode = treeNode.findChildNamed('LegStart');
        const legEndPlaceRefTreeNode = treeNode.findChildNamed('LegEnd');
        if (legStartPlaceRefTreeNode === null || legEndPlaceRefTreeNode === null) {
            return null;
        }
        const legStartPlaceRef = Location.initWithTreeNode(legStartPlaceRefTreeNode);
        const legEndPlaceRef = Location.initWithTreeNode(legEndPlaceRefTreeNode);
        if (legStartPlaceRef === null || legEndPlaceRef === null) {
            return null;
        }
        let distanceS = (_a = treeNode.findTextFromChildNamed('Length')) !== null && _a !== void 0 ? _a : '0';
        const legDistance = parseInt(distanceS);
        const tripLeg = new TripContinuousLeg(legType, legIDx, legDistance, legStartPlaceRef, legEndPlaceRef);
        tripLeg.legDuration = Duration.initWithTreeNode(treeNode);
        tripLeg.pathGuidance = PathGuidance.initWithTreeNode(treeNode);
        tripLeg.legTransportMode = tripLeg.computeLegTransportModeFromTreeNode(treeNode, legType);
        tripLeg.transferMode = tripLeg.computeLegTransferModeFromTreeNode(treeNode);
        const isOthersDriveCar = tripLeg.legTransportMode === 'taxi' || tripLeg.legTransportMode === 'others-drive-car';
        if (isOthersDriveCar) {
            tripLeg.serviceBooking = ServiceBooking.initWithLegTreeNode(treeNode);
        }
        tripLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode);
        if (legType === 'TransferLeg') {
            tripLeg.walkDuration = Duration.initWithTreeNode(treeNode, 'WalkDuration');
        }
        if (legType === 'ContinuousLeg') {
            tripLeg.continousLegService = {
                personalMode: (_b = treeNode.findTextFromChildNamed('Service/PersonalMode')) !== null && _b !== void 0 ? _b : 'other',
                personalModeOfOperation: (_c = treeNode.findTextFromChildNamed('Service/PersonalModeOfOperation')) !== null && _c !== void 0 ? _c : 'other',
            };
        }
        return tripLeg;
    }
    computeLegTransportModeFromTreeNode(treeNode, legType) {
        let legModeS = null;
        if (legType === 'TransferLeg') {
            return null;
        }
        if (legType === 'ContinuousLeg') {
            legModeS = treeNode.findTextFromChildNamed('Service/IndividualMode');
            if (legModeS === null) {
                const personalModeParts = [];
                const personalNodePaths = [
                    'Service/PersonalMode',
                    'Service/PersonalModeOfOperation',
                    'Service/Mode/PtMode',
                    'Service/Mode/siri:RailSubmode',
                    'Service/Mode/siri:WaterSubmode',
                ];
                personalNodePaths.forEach(personalNodePath => {
                    const personalNodeValue = treeNode.findTextFromChildNamed(personalNodePath);
                    if (personalNodeValue !== null) {
                        personalModeParts.push(personalNodeValue);
                    }
                });
                legModeS = personalModeParts.join('.');
            }
        }
        const firstBookingAgency = treeNode.findTextFromChildNamed('Service/BookingArrangements/BookingArrangement/BookingAgencyName/Text');
        const legMode = this.computeLegTransportModeFromString(legModeS, firstBookingAgency);
        if (legMode === null) {
            console.error('ERROR computeLegTransportModeFromString');
            console.log('=> CANT handle mode --' + legModeS + '--');
            console.log(treeNode);
        }
        return legMode;
    }
    computeLegTransferModeFromTreeNode(treeNode) {
        const isOJPv2 = OJP_VERSION === '2.0';
        const transferModeNodeName = isOJPv2 ? 'TransferType' : 'TransferMode';
        const transferModeS = treeNode.findTextFromChildNamed(transferModeNodeName);
        if (transferModeS === null) {
            return null;
        }
        if (transferModeS === 'walk') {
            return 'walk';
        }
        if (transferModeS === 'remainInVehicle') {
            return 'remainInVehicle';
        }
        console.error('CANT map TransferMode from ==' + transferModeS + '==');
        return null;
    }
    computeLegTransportModeFromString(legModeS, firstBookingAgency = null) {
        if (legModeS === null) {
            return null;
        }
        if (legModeS === 'walk') {
            return 'walk';
        }
        if (legModeS === 'self-drive-car') {
            return 'self-drive-car';
        }
        if (legModeS === 'cycle') {
            return 'cycle';
        }
        if (legModeS === 'taxi') {
            // HACK: BE returns 'taxi' for limo, check first booking agency to see if is actually a limo leg
            if ((firstBookingAgency === null || firstBookingAgency === void 0 ? void 0 : firstBookingAgency.indexOf('_limousine_')) !== -1) {
                return 'others-drive-car';
            }
            return 'taxi';
        }
        if (legModeS === 'car.own') {
            return 'self-drive-car';
        }
        if (legModeS === 'car.own.rail.vehicleTunnelTransportRailService') {
            return 'car-shuttle-train';
        }
        if (legModeS === 'car.own.water.localCarFerry') {
            return 'car-ferry';
        }
        if (legModeS === 'foot.own') {
            return 'walk';
        }
        return null;
    }
    isDriveCarLeg() {
        return this.legTransportMode === 'self-drive-car';
    }
    isSharedMobility() {
        if (this.legTransportMode === null) {
            return false;
        }
        const sharedMobilityModes = ['cycle', 'bicycle_rental', 'car_sharing', 'escooter_rental'];
        const hasSharedMobilityMode = sharedMobilityModes.indexOf(this.legTransportMode) !== -1;
        return hasSharedMobilityMode;
    }
    isWalking() {
        return this.legTransportMode === 'walk';
    }
    isTaxi() {
        return this.legTransportMode === 'taxi' || this.legTransportMode === 'others-drive-car';
    }
    formatDistance() {
        if (this.legDistance > 1000) {
            const distanceKmS = (this.legDistance / 1000).toFixed(1) + ' km';
            return distanceKmS;
        }
        return this.legDistance + ' m';
    }
    addToXMLNode(parentNode, xmlConfig) {
        var _a, _b, _c;
        const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const isOJPv2 = xmlConfig.ojpVersion === '2.0';
        const legNodeName = isOJPv2 ? 'Leg' : 'TripLeg';
        const tripLegNode = parentNode.ele(ojpPrefix + legNodeName);
        const legIdTagName = isOJPv2 ? 'Id' : 'LegId';
        tripLegNode.ele(ojpPrefix + legIdTagName, this.legID);
        const legDurationF = (_b = (_a = this.legDuration) === null || _a === void 0 ? void 0 : _a.asOJPFormattedText()) !== null && _b !== void 0 ? _b : null;
        if (legDurationF) {
            tripLegNode.ele(ojpPrefix + 'Duration', legDurationF);
        }
        const tripLegNodeType = tripLegNode.ele(ojpPrefix + this.legType);
        if (this.legType === 'TransferLeg') {
            tripLegNodeType.ele(ojpPrefix + 'TransferType', (_c = this.transferMode) !== null && _c !== void 0 ? _c : 'walk');
        }
        const stopPointTypes = ['From', 'To'];
        stopPointTypes.forEach(stopPointType => {
            var _a;
            const isFrom = stopPointType === 'From';
            const legEndpointTag = isFrom ? 'LegStart' : 'LegEnd';
            const legEndpointNode = tripLegNodeType.ele(ojpPrefix + legEndpointTag);
            const location = isFrom ? this.fromLocation : this.toLocation;
            const stopPlace = location.stopPlace;
            if (stopPlace === null) {
                if (location.geoPosition) {
                    const geoPositionNode = legEndpointNode.ele(ojpPrefix + 'GeoPosition');
                    geoPositionNode.ele(siriPrefix + 'Longitude', location.geoPosition.longitude);
                    geoPositionNode.ele(siriPrefix + 'Latitude', location.geoPosition.latitude);
                    legEndpointNode.ele(ojpPrefix + 'Name').ele(ojpPrefix + 'Text', location.geoPosition.asLatLngString());
                }
            }
            else {
                legEndpointNode.ele(siriPrefix + 'StopPointRef', stopPlace.stopPlaceRef);
                legEndpointNode.ele(ojpPrefix + 'Name').ele(ojpPrefix + 'Text', (_a = stopPlace.stopPlaceName) !== null && _a !== void 0 ? _a : 'n/a');
            }
        });
        if (this.legType === 'ContinuousLeg') {
            if (this.continousLegService) {
                const serviceNode = tripLegNodeType.ele(ojpPrefix + 'Service');
                serviceNode.ele(ojpPrefix + 'PersonalMode', this.continousLegService.personalMode);
                serviceNode.ele(ojpPrefix + 'PersonalModeOfOperation', this.continousLegService.personalModeOfOperation);
            }
        }
        if (legDurationF) {
            tripLegNodeType.ele(ojpPrefix + 'Duration', legDurationF);
        }
        tripLegNodeType.ele(ojpPrefix + 'Length', this.legDistance);
    }
}
