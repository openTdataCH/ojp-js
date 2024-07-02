import { PublicTransportMode } from './public-transport-mode';
import { StopPlace } from '../location/stopplace';
export class JourneyService {
    constructor(journeyRef, ptMode, agencyCode) {
        this.journeyRef = journeyRef;
        this.ptMode = ptMode;
        this.agencyCode = agencyCode;
        this.originStopPlace = null;
        this.destinationStopPlace = null;
        this.serviceLineNumber = null;
        this.journeyNumber = null;
        this.siriSituationIds = [];
        this.siriSituations = [];
        this.serviceAttributes = {};
    }
    static initWithTreeNode(treeNode) {
        const serviceTreeNode = treeNode.findChildNamed('Service');
        if (serviceTreeNode === null) {
            return null;
        }
        const journeyRef = serviceTreeNode.findTextFromChildNamed('JourneyRef');
        const ptMode = PublicTransportMode.initWithServiceTreeNode(serviceTreeNode);
        // TODO - this should be renamed to code
        // <siri:LineRef>ojp:91036:A:H</siri:LineRef>
        // <siri:OperatorRef>SBB</siri:OperatorRef>
        // <PublicCode>InterRegio</PublicCode>
        const agencyCode = serviceTreeNode.findTextFromChildNamed('siri:OperatorRef');
        if (!(journeyRef && ptMode && agencyCode)) {
            return null;
        }
        const legService = new JourneyService(journeyRef, ptMode, agencyCode);
        legService.originStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Origin');
        legService.destinationStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Destination');
        legService.serviceLineNumber = serviceTreeNode.findTextFromChildNamed('PublishedServiceName/Text');
        legService.journeyNumber = treeNode.findTextFromChildNamed('TrainNumber');
        legService.siriSituationIds = [];
        const situationFullRefTreeNodes = serviceTreeNode.findChildrenNamed('SituationFullRef');
        situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
            const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('siri:SituationNumber');
            if (situationNumber) {
                legService.siriSituationIds.push(situationNumber);
            }
        });
        legService.serviceAttributes = {};
        serviceTreeNode.findChildrenNamed('Attribute').forEach(attributeTreeNode => {
            let code = attributeTreeNode.findTextFromChildNamed('Code');
            if (code === null) {
                console.error('ERROR - cant find code for Attribute');
                console.log(attributeTreeNode);
                return;
            }
            if (code.startsWith('A_')) {
                // normalize HRDF *A attributes, strip A__ chars
                code = code.replace(/A_*/, '');
            }
            const text = attributeTreeNode.findTextFromChildNamed('UserText/Text');
            if (text === null) {
                console.error('ERROR - cant find code/text for Attribute');
                console.log(attributeTreeNode);
                return;
            }
            const serviceAttribute = {
                code: code,
                text: text,
                extra: {},
            };
            attributeTreeNode.children.forEach(childTreeNode => {
                if (childTreeNode.name.startsWith('siri:')) {
                    const extraAttributeParts = childTreeNode.name.split('siri:');
                    if (extraAttributeParts.length !== 2) {
                        return;
                    }
                    const extraAttributeKey = extraAttributeParts[1];
                    const extraAttributeValue = childTreeNode.text;
                    if (extraAttributeValue === null) {
                        return;
                    }
                    serviceAttribute.extra[extraAttributeKey] = extraAttributeValue;
                }
            });
            legService.serviceAttributes[code] = serviceAttribute;
        });
        return legService;
    }
    computeLegLineType() {
        const isPostAuto = this.agencyCode === '801';
        if (isPostAuto) {
            return 'PostAuto';
        }
        if (this.ptMode.isRail()) {
            return 'LongDistanceRail';
        }
        if (this.ptMode.isDemandMode) {
            return 'OnDemand';
        }
        return 'Bus';
    }
    formatServiceName() {
        var _a, _b, _c, _d;
        if (this.ptMode.isDemandMode) {
            return (_a = this.serviceLineNumber) !== null && _a !== void 0 ? _a : 'OnDemand';
        }
        const nameParts = [];
        if (this.serviceLineNumber) {
            if (!this.ptMode.isRail()) {
                nameParts.push((_b = this.ptMode.shortName) !== null && _b !== void 0 ? _b : this.ptMode.ptMode);
            }
            nameParts.push(this.serviceLineNumber);
            nameParts.push((_c = this.journeyNumber) !== null && _c !== void 0 ? _c : '');
        }
        else {
            nameParts.push((_d = this.ptMode.shortName) !== null && _d !== void 0 ? _d : this.ptMode.ptMode);
        }
        nameParts.push('(' + this.agencyCode + ')');
        return nameParts.join(' ');
    }
}
