import { GeoRestrictionPoiOSMTag } from "../types/geo-restriction.type"
import { TreeNode } from "../xml/tree-node"

const mapPoiSubCategoryIcons = <Record<GeoRestrictionPoiOSMTag, string[]>>{
  service: ['atm', 'hairdresser'],
  shopping: ['all', 'clothes', 'optician'],
  catering: ['all'],
  accommodation: ['all'],
}

export class PointOfInterest {
  public code: string
  public name: string
  public category: GeoRestrictionPoiOSMTag
  public subCategory: string | null
  public categoryTags: string[]

  constructor(code: string, name: string, category: GeoRestrictionPoiOSMTag, subCategory: string | null, categoryTags: string[]) {
    this.code = code
    this.name = name
    this.category = category
    this.subCategory = subCategory
    this.categoryTags = categoryTags
  }

  public static initWithLocationTreeNode(locationTreeNode: TreeNode): PointOfInterest | null {
    const treeNode = locationTreeNode.findChildNamed('ojp:PointOfInterest');
    if (treeNode === null) {
      return null;
    }
    
    const code = treeNode.findTextFromChildNamed('ojp:PointOfInterestCode');
    const name = treeNode.findTextFromChildNamed('ojp:PointOfInterestName/ojp:Text');

    if (!(code && name)) {
      return null;
    }

    const categoryTags: string[] = [];
    let category: GeoRestrictionPoiOSMTag | null = null;
    let subCategory: string | null = null;

    const categoryTreeNodes = treeNode.findChildrenNamed('ojp:PointOfInterestCategory');
    categoryTreeNodes.forEach(categoryTreeNode => {
      const tagValue = categoryTreeNode.findTextFromChildNamed('ojp:OsmTag/ojp:Value');
      if (tagValue) {
        categoryTags.push(tagValue);
      }

      const tagKey = categoryTreeNode.findTextFromChildNamed('ojp:OsmTag/ojp:Tag');
      if (tagKey === 'POI_0' || tagKey === 'amenity') {
        category = tagValue as GeoRestrictionPoiOSMTag;
      }

      if (tagKey === 'POI_1') {
        subCategory = tagValue;
      }
    });

    if (category === null) {
      console.error('PointOfInterest.initWithLocationTreeNode error - no category');
      console.log(locationTreeNode);
      return null;
    }

    const poi = new PointOfInterest(code, name, category, subCategory, categoryTags);
    return poi;
  }

  // The return is a 50px image in ./src/assets/map-style-icons
  // i.e. ./src/assets/map-style-icons/poi-atm.png
  // icons from https://www.shareicon.net/author/adiante-apps
  public computePoiMapIcon(): string {
    const fallbackIcon = 'poi-unknown';

    if (!(this.category in mapPoiSubCategoryIcons)) {
      return fallbackIcon;
    }

    const hasSubCategory = this.subCategory && (mapPoiSubCategoryIcons[this.category].indexOf(this.subCategory) > -1);
    if (hasSubCategory) {
      const mapIcon = 'poi-' + this.category + '-' + this.subCategory;
      return mapIcon;
    }

    const hasAllSubCategory = mapPoiSubCategoryIcons[this.category].indexOf('all') > -1;
    if (hasAllSubCategory) {
      const mapIcon = 'poi-' + this.category + '-all';
      return mapIcon;
    }

    return fallbackIcon;
  }
}
