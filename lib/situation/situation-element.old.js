import { SituationContent } from "./situation-content";
import { PtSituationSource } from './situation-source';
export class PtSituationElement {
    constructor(situationNumber, creationTime, participantRef, version, source, validityPeriod, priority, situationContent) {
        this.situationNumber = situationNumber;
        this.creationTime = creationTime;
        this.participantRef = participantRef;
        this.version = version;
        this.source = source;
        this.validityPeriod = validityPeriod;
        this.priority = priority;
        this.situationContent = situationContent;
        this.treeNode = null;
    }
    static initWithSituationTreeNode(treeNode) {
        const situationNumber = treeNode.findTextFromChildNamed('siri:SituationNumber');
        const creationTimeS = treeNode.findTextFromChildNamed('siri:CreationTime');
        if (creationTimeS === null) {
            console.error('ERROR: PtSituationElement.initFromSituationNode - creationTimeS is null');
            console.log(treeNode);
            return null;
        }
        const creationTime = new Date(creationTimeS);
        const participantRef = treeNode.findTextFromChildNamed('siri:ParticipantRef');
        const versionS = treeNode.findTextFromChildNamed('siri:Version');
        if (versionS === null) {
            console.error('ERROR: PtSituationElement.initFromSituationNode - Version is NULL');
            console.log(treeNode);
            return null;
        }
        const version = parseInt(versionS);
        const situationSource = PtSituationSource.initWithSituationTreeNode(treeNode);
        const validityPeriodStartDateS = treeNode.findTextFromChildNamed('siri:ValidityPeriod/siri:StartTime');
        const validityPeriodEndDateS = treeNode.findTextFromChildNamed('siri:ValidityPeriod/siri:EndTime');
        if (!(validityPeriodStartDateS && validityPeriodEndDateS)) {
            console.error('ERROR: PtSituationElement.initFromSituationNode - ValidityPeriod is null');
            console.log('      PtSituationElement.initFromSituationNode - ValidityPeriod/StartTime' + validityPeriodStartDateS);
            console.log('      PtSituationElement.initFromSituationNode - ValidityPeriod/EndTime' + validityPeriodEndDateS);
            return null;
        }
        const validityPeriod = {
            startDate: new Date(validityPeriodStartDateS),
            endDate: new Date(validityPeriodEndDateS)
        };
        const situationPriorityS = treeNode.findTextFromChildNamed('siri:Priority');
        if (situationPriorityS === null) {
            console.error('ERROR: PtSituationElement.initFromSituationNode - Priority is NULL');
            console.log(treeNode);
            return null;
        }
        const situationPriority = parseInt(situationPriorityS);
        const situationContent = SituationContent.initWithSituationTreeNode(treeNode);
        if (!(situationNumber && participantRef && situationSource && situationContent)) {
            console.error('ERROR: PtSituationElement.initFromSituationNode - cant init');
            console.log(treeNode);
            return null;
        }
        const situationElement = new PtSituationElement(situationNumber, creationTime, participantRef, version, situationSource, validityPeriod, situationPriority, situationContent);
        situationElement.treeNode = treeNode;
        return situationElement;
    }
}
