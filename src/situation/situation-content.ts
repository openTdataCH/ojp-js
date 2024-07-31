import { TreeNode } from "../xml/tree-node"

export class SituationContent {
  public summary: string
  public descriptions: string[]
  public details: string[]

  constructor(summary: string, descriptions: string[], details: string[]) {
    this.summary = summary
    this.descriptions = descriptions
    this.details = details
  }

  public static initWithSituationTreeNode(treeNode: TreeNode): SituationContent | null {
    const summary = treeNode.findTextFromChildNamed('siri:Summary');

    if (summary === null) {
      console.error('ERROR: SituationContent.initFromSituationNode - empty summary');
      console.log(treeNode);

      return null;
    }

    const descriptions: string[] = []
    const descriptionNodes = treeNode.findChildrenNamed('siri:Description');
    descriptionNodes.forEach(descriptionTreeNode => {
      const descriptionText = descriptionTreeNode.text;
      if (descriptionText) {
        descriptions.push(descriptionText);
      }
    });

    if (descriptions.length === 0) {
      console.error('ERROR: SituationContent.initFromSituationNode - empty description');
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

    const situationContent = new SituationContent(summary, descriptions, details);
    return situationContent;
  }
}
