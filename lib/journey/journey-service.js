import { PublicTransportMode } from './public-transport-mode';
import { StopPlace } from '../location/stopplace';
export class JourneyService {
    constructor(journeyRef, operatingDayRef, ptMode, agencyCode) {
        this.journeyRef = journeyRef;
        this.operatingDayRef = operatingDayRef;
        this.lineRef = null;
        this.directionRef = null;
        this.ptMode = ptMode;
        this.agencyCode = agencyCode;
        this.originStopPlace = null;
        this.destinationStopPlace = null;
        this.productCategory = null;
        this.serviceLineNumber = null;
        this.journeyNumber = null;
        this.siriSituationIds = [];
        this.siriSituations = [];
        this.serviceAttributes = {};
        this.hasCancellation = null;
        this.hasDeviation = null;
        this.isUnplanned = null;
    }
    static initWithTreeNode(treeNode) {
        var _a, _b, _c;
        const serviceTreeNode = treeNode.findChildNamed('Service');
        if (serviceTreeNode === null) {
            return null;
        }
        const journeyRef = serviceTreeNode.findTextFromChildNamed('JourneyRef');
        const ptMode = PublicTransportMode.initWithServiceTreeNode(serviceTreeNode);
        const agencyCode = (() => {
            const ojpAgencyId = serviceTreeNode.findTextFromChildNamed('siri:OperatorRef');
            if (ojpAgencyId === null) {
                return 'n/a OperatorRef';
            }
            return ojpAgencyId.replace('ojp:', '');
        })();
        const operatingDayRef = serviceTreeNode.findTextFromChildNamed('OperatingDayRef');
        if (!(journeyRef && ptMode && operatingDayRef)) {
            return null;
        }
        const legService = new JourneyService(journeyRef, operatingDayRef, ptMode, agencyCode);
        legService.lineRef = serviceTreeNode.findTextFromChildNamed('siri:LineRef');
        legService.directionRef = serviceTreeNode.findTextFromChildNamed('siri:DirectionRef');
        legService.originStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Origin');
        legService.destinationStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Destination');
        const productCategoryNode = serviceTreeNode.findChildNamed('ProductCategory');
        if (productCategoryNode) {
            legService.productCategory = {
                name: (_a = productCategoryNode.findTextFromChildNamed('Name/Text')) !== null && _a !== void 0 ? _a : 'n/a Name',
                shortName: (_b = productCategoryNode.findTextFromChildNamed('ShortName/Text')) !== null && _b !== void 0 ? _b : 'n/a ShortName',
                productCategoryRef: (_c = productCategoryNode.findTextFromChildNamed('ProductCategoryRef')) !== null && _c !== void 0 ? _c : 'n/a ProductCategoryRef',
            };
        }
        legService.serviceLineNumber = serviceTreeNode.findTextFromChildNamed('PublishedServiceName/Text');
        legService.journeyNumber = serviceTreeNode.findTextFromChildNamed('TrainNumber');
        legService.siriSituationIds = [];
        const situationsContainerNode = serviceTreeNode.findChildNamed('SituationFullRefs');
        if (situationsContainerNode) {
            const situationFullRefTreeNodes = situationsContainerNode.findChildrenNamed('SituationFullRef');
            situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
                const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('siri:SituationNumber');
                if (situationNumber) {
                    legService.siriSituationIds.push(situationNumber);
                }
            });
        }
        legService.serviceAttributes = {};
        serviceTreeNode.findChildrenNamed('Attribute').forEach(attributeTreeNode => {
            const code = attributeTreeNode.findTextFromChildNamed('Code');
            if (code === null) {
                console.error('ERROR - cant find code for Attribute');
                console.log(attributeTreeNode);
                return;
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
        const cancelledNode = serviceTreeNode.findChildNamed('Cancelled');
        if (cancelledNode) {
            legService.hasCancellation = cancelledNode.text === 'true';
        }
        const deviationNode = serviceTreeNode.findChildNamed('Deviation');
        if (deviationNode) {
            legService.hasDeviation = deviationNode.text === 'true';
        }
        const unplannedNode = serviceTreeNode.findChildNamed('Unplanned');
        if (unplannedNode) {
            legService.isUnplanned = unplannedNode.text === 'true';
        }
        return legService;
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
    addToXMLNode(parentNode, xmlConfig) {
        const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const isOJPv1 = xmlConfig.ojpVersion === '1.0';
        const serviceNode = parentNode.ele(ojpPrefix + 'Service');
        serviceNode.ele(ojpPrefix + 'JourneyRef', this.journeyRef);
        serviceNode.ele(ojpPrefix + 'OperatingDayRef', this.operatingDayRef);
        if (this.lineRef) {
            serviceNode.ele(siriPrefix + 'LineRef', this.lineRef);
        }
        if (this.directionRef) {
            serviceNode.ele(siriPrefix + 'DirectionRef', this.directionRef);
        }
        this.ptMode.addToXMLNode(serviceNode, xmlConfig);
        if (this.productCategory) {
            const productCategoryNode = serviceNode.ele(ojpPrefix + 'ProductCategory');
            productCategoryNode.ele('Name').ele('Text', this.productCategory.name);
            productCategoryNode.ele('ShortName').ele('Text', this.productCategory.shortName);
            productCategoryNode.ele('ProductCategoryRef', this.productCategory.productCategoryRef);
        }
        if (this.serviceLineNumber) {
            const serviceTagName = isOJPv1 ? 'PublishedLineName' : 'PublishedServiceName';
            serviceNode.ele(ojpPrefix + serviceTagName).ele(ojpPrefix + 'Text', this.serviceLineNumber);
        }
        if (this.journeyNumber) {
            serviceNode.ele(ojpPrefix + 'TrainNumber', this.journeyNumber);
        }
        for (const key in this.serviceAttributes) {
            const attrData = this.serviceAttributes[key];
            const attributeNode = serviceNode.ele(ojpPrefix + 'Attribute');
            attributeNode.ele(ojpPrefix + 'UserText').ele(ojpPrefix + 'Text', attrData.text);
            attributeNode.ele(ojpPrefix + 'Code', attrData.code);
        }
        let agencyID_s = this.agencyCode;
        if (!agencyID_s.startsWith('ojp:')) {
            agencyID_s = 'ojp:' + agencyID_s;
        }
        serviceNode.ele(ojpPrefix + 'OperatorRef', agencyID_s);
    }
}
