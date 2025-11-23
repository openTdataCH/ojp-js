import { XML_Config } from "../types/_all"
import { RestrictionPoiOSMTag } from "../types/lir-restrictions.type"
import { TreeNode } from "../xml/tree-node"

export class PointOfInterest {
  public code: string;
  public name: string;
  public category: RestrictionPoiOSMTag;
  public subCategory: string | null;
  public categoryTags: string[];
  public mapAdditionalInformation: Record<string, string>;

  constructor(code: string, name: string, category: RestrictionPoiOSMTag, subCategory: string | null, categoryTags: string[], mapAdditionalInformation: Record<string, string>) {
    this.code = code;
    this.name = name;
    this.category = category;
    this.subCategory = subCategory;
    this.categoryTags = categoryTags;
    this.mapAdditionalInformation = mapAdditionalInformation;
  }

  public static initWithLocationTreeNode(locationTreeNode: TreeNode, xmlConfig: XML_Config): PointOfInterest | null {
    const treeNode = locationTreeNode.findChildNamed('PointOfInterest');
    if (treeNode === null) {
      return null;
    }

    const isOJPv2 = xmlConfig.ojpVersion === '2.0';
    
    const codeTagName = isOJPv2 ? 'PublicCode' : 'PointOfInterestCode';
    const nameTagName = isOJPv2 ? 'Name/Text' : 'PointOfInterestName/Text';
    const code = treeNode.findTextFromChildNamed(codeTagName);
    const name = treeNode.findTextFromChildNamed(nameTagName);

    if (!(code && name)) {
      return null;
    }

    const categoryTags: string[] = [];
    let category: RestrictionPoiOSMTag | null = null;
    let subCategory: string | null = null;
    
    const categoryTreeNodes = treeNode.findChildrenNamed('PointOfInterestCategory');
    categoryTreeNodes.forEach(categoryTreeNode => {
      if (isOJPv2) {
        const categoryText = categoryTreeNode.findTextFromChildNamed('PointOfInterestClassification');
        if (categoryText !== null) {
          category = categoryText as RestrictionPoiOSMTag;
        }
      } else {
        const tagValue = categoryTreeNode.findTextFromChildNamed('OsmTag/Value');
        if (tagValue) {
          categoryTags.push(tagValue);
        }

        const tagKey = categoryTreeNode.findTextFromChildNamed('OsmTag/Tag');
        if (tagKey === 'POI_0' || tagKey === 'amenity') {
          category = tagValue as RestrictionPoiOSMTag;
        }

        if (tagKey === 'POI_1') {
          subCategory = tagValue;
        }
      }
    });

    if (category === null) {
      console.error('PointOfInterest.initWithLocationTreeNode error - no category');
      category = 'none';
    }

    // POIAdditionalInformation is OJP v2 only
    const mapAdditionalInformation: Record<string, string> = {};
    if (isOJPv2) {
      const poiAdditonalInformationWrapperNode = treeNode.findChildNamed('POIAdditionalInformation');
      if (poiAdditonalInformationWrapperNode) {
        const additonalInfoNodes = poiAdditonalInformationWrapperNode.findChildrenNamed('POIAdditionalInformation');
        additonalInfoNodes.forEach(additonalInfoNode => {
          const keyText = additonalInfoNode.findTextFromChildNamed('Key');
          const valueText = additonalInfoNode.findTextFromChildNamed('Value');
          if ((keyText !== null) && (valueText !== null)) {
            mapAdditionalInformation[keyText] = valueText;
          }
        });
      }
    }
    
    const poi = new PointOfInterest(code, name, category, subCategory, categoryTags, mapAdditionalInformation);
    return poi;
  }
}
