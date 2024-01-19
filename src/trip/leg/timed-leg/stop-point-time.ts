import { TreeNode } from "../../../xml/tree-node"

export class StopPointTime {
  public timetableTime: Date
  public estimatedTime: Date | null
  public delayMinutes: number | null

  constructor(timetableTime: Date, estimatedTime: Date | null) {
    this.timetableTime = timetableTime
    this.estimatedTime = estimatedTime

    if (estimatedTime) {
      const dateDiffSeconds = (estimatedTime.getTime() - timetableTime.getTime()) / 1000
      this.delayMinutes = Math.floor(dateDiffSeconds / 60)
    } else {
      this.delayMinutes = null
    }
  }

  public static initWithParentTreeNode(parentTreeNode: TreeNode, stopTimeType: string): StopPointTime | null {
    const stopTimeTreeNode = parentTreeNode.findChildNamed(stopTimeType);
    if (stopTimeTreeNode === null) {
      return null
    }

    const stopTime = StopPointTime.initWithContextTreeNode(stopTimeTreeNode);
    return stopTime;
  }

  private static initWithContextTreeNode(contextNode: TreeNode): StopPointTime | null {
    const timetableTimeS = contextNode.findTextFromChildNamed('TimetabledTime');
    if (timetableTimeS === null) {
      return null;
    }

    const timetableTime = new Date(Date.parse(timetableTimeS));

    let estimatedTime: Date | null = null;
    const estimatedTimeS = contextNode.findTextFromChildNamed('EstimatedTime');
    if (estimatedTimeS) {
      estimatedTime = new Date(Date.parse(estimatedTimeS));
    }

    const stopPointTime = new StopPointTime(timetableTime, estimatedTime)
    return stopPointTime;
  }

}
