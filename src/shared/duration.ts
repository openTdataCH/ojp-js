import { TreeNode } from "../xml/tree-node"

export class Duration {
  public hours: number
  public minutes: number
  public totalMinutes: number

  private constructor(hours: number, minutes: number) {
    this.hours = hours
    this.minutes = minutes
    this.totalMinutes = hours * 60 + minutes
  }

  public static initWithTreeNode(parentTreeNode: TreeNode, nodeName: string = 'Duration'): Duration | null {
    const durationS = parentTreeNode.findTextFromChildNamed(nodeName);
    if (durationS === null) {
      return null;
    }

    const duration = Duration.initFromDurationText(durationS);

    return duration;
  }

  public static initFromDurationText(durationS: string | null): Duration | null {
    if (durationS === null) {
      return null;
    }

    // PT4H19M
    durationS = durationS.replace('PT', '');

    let hours = 0
    const hoursMatches = durationS.match(/([0-9]+?)H/);
    if (hoursMatches) {
        hours = parseInt(hoursMatches[1])
    }

    let minutes = 0
    const minutesMatches = durationS.match(/([0-9]+?)M/);
    if (minutesMatches) {
        minutes = parseInt(minutesMatches[1])
    }

    const duration = new Duration(hours, minutes)
    return duration;
  }

  public static initFromTotalMinutes(totalMinutes: number): Duration {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes - hours * 60

    const duration = new Duration(hours, minutes)
    return duration
  }

  public formatDuration(): string {
    const durationParts: string[] = []
  
    if (this.hours > 0) {
      durationParts.push(this.hours + 'h ')
    }

    durationParts.push(this.minutes + 'min')

    return durationParts.join('')
  }

  public plus(otherDuration: Duration): Duration {
    return Duration.initFromTotalMinutes(this.totalMinutes + otherDuration.totalMinutes)
  }

  public asOJPFormattedText(): string {
    const parts: string[] = [];

    parts.push('PT');
    if (this.hours > 0) {
      parts.push('' + this.hours + 'H');
    }
    parts.push('' + this.minutes + 'M');

    return parts.join('');
  }
}
