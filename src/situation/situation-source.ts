import { XPathOJP } from "../helpers/xpath-ojp"

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

  public static initFromSituationNode(node: Node): PtSituationSource | null {
    const sourceType = XPathOJP.queryText('siri:Source/siri:SourceType', node)

    if (sourceType === null) {
      console.log('ERROR - cant PtSituationSource.initFromSituationNode')
      console.log(node);
      return null;
    }

    const situationSource = new PtSituationSource(sourceType);

    situationSource.countryRef = XPathOJP.queryText('siri:Source/siri:CountryRef', node)
    situationSource.name = XPathOJP.queryText('siri:Source/siri:Name', node)
    situationSource.externalCode = XPathOJP.queryText('siri:Source/siri:ExternalCode', node)

    return situationSource
  }
}
