export class SituationContent {
    constructor(summary, description, details) {
        this.summary = summary;
        this.description = description;
        this.details = details;
    }
    static initWithSituationTreeNode(treeNode) {
        var _a, _b;
        const summary = (_a = treeNode.findTextFromChildNamed('siri:Summary')) !== null && _a !== void 0 ? _a : 'n/a Summary';
        const description = (_b = treeNode.findTextFromChildNamed('siri:Description')) !== null && _b !== void 0 ? _b : 'n/a Description';
        const details = [];
        const detailNodes = treeNode.findChildrenNamed('siri:Detail');
        detailNodes.forEach(detailTreeNode => {
            const detailText = detailTreeNode.text;
            if (detailText) {
                details.push(detailText);
            }
        });
        const situationContent = new SituationContent(summary, description, details);
        return situationContent;
    }
}
