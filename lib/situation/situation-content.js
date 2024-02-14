export class SituationContent {
    constructor(summary, description, details) {
        this.summary = summary;
        this.description = description;
        this.details = details;
    }
    static initWithSituationTreeNode(treeNode) {
        const summary = treeNode.findTextFromChildNamed('siri:Summary');
        const description = treeNode.findTextFromChildNamed('siri:Description');
        if (!(summary && description)) {
            console.error('ERROR: SituationContent.initFromSituationNode - cant init');
            console.log(treeNode);
            return null;
        }
        const details = [];
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
