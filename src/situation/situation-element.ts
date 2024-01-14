import { TreeNode } from "../xml/tree-node"

import { SituationContent } from "./situation-content"
import { PtSituationSource } from './situation-source'

interface TimeInterval {
  startDate: Date
  endDate: Date
}

export class PtSituationElement {
  public situationNumber: string
  public creationTime: Date
  public participantRef: string
  public version: number
  public source: PtSituationSource
  public validityPeriod: TimeInterval
  public priority: number
  public situationContent: SituationContent

  public treeNode: TreeNode | null

  constructor(
    situationNumber: string,
    creationTime: Date,
    participantRef: string,
    version: number,
    source: PtSituationSource,
    validityPeriod: TimeInterval,
    priority: number,
    situationContent: SituationContent
  ) {
    this.situationNumber = situationNumber
    this.creationTime = creationTime
    this.participantRef = participantRef
    this.version = version
    this.source = source
    this.validityPeriod = validityPeriod
    this.priority = priority
    this.situationContent = situationContent

    this.treeNode = null;
  }

  public static initWithSituationTreeNode(treeNode: TreeNode): PtSituationElement | null {
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
    const validityPeriod: TimeInterval = {
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

    const situationElement = new PtSituationElement(
      situationNumber, creationTime, participantRef, version, situationSource,
      validityPeriod, situationPriority,
      situationContent,
    );
    situationElement.treeNode = treeNode;

    return situationElement;
  }
}
