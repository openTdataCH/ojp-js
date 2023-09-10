import { XPathOJP } from "../helpers/xpath-ojp"

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

  public nodeXML: Node | null

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

    this.nodeXML = null;
  }

  public static initFromSituationNode(node: Node): PtSituationElement | null {
    const situationNumber = XPathOJP.queryText('siri:SituationNumber', node);

    const creationTimeS = XPathOJP.queryText('siri:CreationTime', node);
    if (creationTimeS === null) {
      console.error('ERROR: PtSituationElement.initFromSituationNode - creationTimeS is null');
      console.log(node);
      return null;
    }
    const creationTime = new Date(creationTimeS);

    const participantRef = XPathOJP.queryText('siri:ParticipantRef', node);

    const versionS = XPathOJP.queryText('siri:Version', node);
    if (versionS === null) {
      console.error('ERROR: PtSituationElement.initFromSituationNode - Version is NULL');
      console.log(node);
      return null;
    }
    const version = parseInt(versionS)

    const situationSource = PtSituationSource.initFromSituationNode(node);

    const validityPeriodStartDateS = XPathOJP.queryText('siri:ValidityPeriod/siri:StartTime', node);
    const validityPeriodEndDateS = XPathOJP.queryText('siri:ValidityPeriod/siri:EndTime', node);
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

    const situationPriorityS = XPathOJP.queryText('siri:Priority', node);
    if (situationPriorityS === null) {
      console.error('ERROR: PtSituationElement.initFromSituationNode - Priority is NULL');
      console.log(node);
      return null;
    }
    const situationPriority = parseInt(situationPriorityS)

    const situationContent = SituationContent.initFromSituationNode(node);

    if (!(situationNumber && participantRef && situationSource && situationContent)) {
      console.error('ERROR: PtSituationElement.initFromSituationNode - cant init');
      console.log(node);
      return null;
    }

    const situationElement = new PtSituationElement(
      situationNumber, creationTime, participantRef, version, situationSource,
      validityPeriod, situationPriority,
      situationContent,
    );
    situationElement.nodeXML = node;

    return situationElement;
  }
}
