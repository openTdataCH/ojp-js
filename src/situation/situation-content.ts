import { TreeNode } from "../xml/tree-node"

export class SituationContent {
  public summary: string
  public description: string
  public details: string[]

  constructor(summary: string, description: string, details: string[]) {
    this.summary = summary
    this.description = description
    this.details = details
  }

  public static initWithSituationTreeNode(treeNode: TreeNode): SituationContent | null {
    const summary = treeNode.findTextFromChildNamed('siri:Summary');
    const description = treeNode.findTextFromChildNamed('siri:Description');

    if (!(summary && description)) {
      console.error('ERROR: SituationContent.initFromSituationNode - cant init');
      console.log(treeNode);

      return null;
    }

    const details: string[] = []
    const detailNodes = treeNode.findChildrenNamed('siri:Detail');
    detailNodes.forEach(detailTreeNode => {
      const detailText = detailTreeNode.text;
      if (detailText) {
        details.push(detailText);
      }
    });

    if (details.length === 0) {
      console.error('ERROR: SituationContent.initFromSituationNode - empty details');
      console.log(treeNode);

      return null;
    }

    const situationContent = new SituationContent(summary, description, details);
    return situationContent;
  }
}
