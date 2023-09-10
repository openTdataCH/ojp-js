import { XPathOJP } from "../helpers/xpath-ojp"

export class SituationContent {
  public summary: string
  public description: string
  public details: string[]

  constructor(summary: string, description: string, details: string[]) {
    this.summary = summary
    this.description = description
    this.details = details
  }

  public static initFromSituationNode(contextNode: Node): SituationContent | null {
    const summary = XPathOJP.queryText('siri:Summary', contextNode);
    const description = XPathOJP.queryText('siri:Description', contextNode);

    if (!(summary && description)) {
      console.error('ERROR: SituationContent.initFromSituationNode - cant init');
      console.log(contextNode);

      return null;
    }

    const details: string[] = []
    const detailNodes = XPathOJP.queryNodes('siri:Detail', contextNode);
    detailNodes.forEach(node => {
      const detailText = XPathOJP.queryText('.', node);
      if (detailText) {
        details.push(detailText);
      }
    });

    if (details.length === 0) {
      console.error('ERROR: SituationContent.initFromSituationNode - empty details');
      console.log(contextNode);

      return null;
    }

    const situationContent = new SituationContent(summary, description, details);
    return situationContent;
  }
}
