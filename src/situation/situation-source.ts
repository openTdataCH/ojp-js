import { TreeNode } from "../xml/tree-node"

export class PtSituationSource {
  public sourceType: string
  public countryRef: string | null
  public name: string | null
  public externalCode: string | null

  constructor(sourceType: string) {
    this.sourceType = sourceType
    this.countryRef = null;
    this.name = null
    this.externalCode = null
  }

  public static initWithSituationTreeNode(treeNode: TreeNode): PtSituationSource | null {
    const sourceType = treeNode.findTextFromChildNamed('siri:Source/siri:SourceType');

    if (sourceType === null) {
      console.log('ERROR - cant PtSituationSource.initFromSituationNode')
      console.log(treeNode);
      return null;
    }

    const situationSource = new PtSituationSource(sourceType);
    situationSource.countryRef = treeNode.findTextFromChildNamed('siri:Source/siri:CountryRef');
    situationSource.name = treeNode.findTextFromChildNamed('siri:Source/siri:Name');
    situationSource.externalCode = treeNode.findTextFromChildNamed('siri:Source/siri:ExternalCode');

    return situationSource;
  }
}
