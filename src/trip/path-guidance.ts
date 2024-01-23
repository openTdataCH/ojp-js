import { TreeNode } from "../xml/tree-node";
import { LinkProjection } from "./link-projection";

export class PathGuidance {
  public sections: PathGuidanceSection[];

  constructor(sections: PathGuidanceSection[]) {
    this.sections = sections;
  }

  public static initWithTreeNode(treeNode: TreeNode): PathGuidance | null {
    const pathGuidanceTreeNode = treeNode.findChildNamed('PathGuidance');
    if (pathGuidanceTreeNode === null) {
      return null;
    }

    let sections: PathGuidanceSection[] = [];

    const sectionTreeNodes = pathGuidanceTreeNode.findChildrenNamed('PathGuidanceSection');
    sectionTreeNodes.forEach(sectionTreeNode => {
      const pathGuidanceSection = PathGuidanceSection.initWithSectionTreeNode(sectionTreeNode);
      if (pathGuidanceSection) {
        sections.push(pathGuidanceSection)
      }
    });
    
    const pathGuidance = new PathGuidance(sections);

    return pathGuidance;
  }
}

class PathGuidanceSection {
  public trackSection: TrackSection | null
  public guidanceAdvice: string | null
  public turnAction: string | null

  constructor() {
    this.trackSection = null
    this.guidanceAdvice = null
    this.turnAction = null
  }

  public static initWithSectionTreeNode(sectionTreeNode: TreeNode): PathGuidanceSection {
    const pathGuidanceSection = new PathGuidanceSection();
    const trackSectionTreeNode = sectionTreeNode.findChildNamed('TrackSection');

    if (trackSectionTreeNode) {
      pathGuidanceSection.trackSection = TrackSection.initWithTrackSectionTreeNode(trackSectionTreeNode);
    }

    pathGuidanceSection.guidanceAdvice = sectionTreeNode.findTextFromChildNamed('GuidanceAdvice');
    pathGuidanceSection.turnAction = sectionTreeNode.findTextFromChildNamed('TurnAction');

    return pathGuidanceSection;
  }
}

class TrackSection {
  public linkProjection: LinkProjection | null;
  public roadName: string | null;
  public duration: string | null;
  public length: number | null;

  constructor() {
    this.linkProjection = null;
    this.roadName = null;
    this.duration = null;
    this.length = null;
  }

  public static initWithTrackSectionTreeNode(trackSectionTreeNode: TreeNode): TrackSection {
    const trackSection = new TrackSection();

    trackSection.linkProjection = LinkProjection.initWithTreeNode(trackSectionTreeNode);
    trackSection.roadName = trackSectionTreeNode.findTextFromChildNamed('RoadName');
    trackSection.duration = trackSectionTreeNode.findTextFromChildNamed('Duration');

    const lengthS = trackSectionTreeNode.findTextFromChildNamed('Length');
    if (lengthS !== null) {
      trackSection.length = parseInt(lengthS, 10);
    }

    return trackSection;
  }
}
