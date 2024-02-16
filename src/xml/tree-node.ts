import sax from 'sax';

export class TreeNode {
  public name: string;
  public parentName: string | null;
  public attributes: { [key: string]: sax.QualifiedAttribute };
  public children: TreeNode[];
  public text: string | null;

  constructor(
    name: string,
    parentName: string | null,
    attributes: { [key: string]: sax.QualifiedAttribute },
    children: TreeNode[],
    text: string | null
  ) {
    this.name = name;
    this.parentName = parentName;
    this.attributes = attributes;
    this.children = children;
    this.text = text;
  }

  findTextFromChildNamed(expr: string): string | null {
    const exprParts = expr.split("/");

    let contextNode: TreeNode | null = this;
    exprParts.forEach((nodeName, idx) => {
      if (contextNode) {
        const newContextNode = contextNode.findChildNamed(nodeName);
        contextNode = newContextNode;
      }
    });

    const contextNodeText = contextNode?.text ?? null;
    return contextNodeText;
  }

  findChildNamed(expr: string): TreeNode | null {
    const exprParts = expr.split("/");

    let contextNode: TreeNode | null = this;
    exprParts.forEach((nodeName, idx) => {
      const newContextNode =
        contextNode?.children.find((el) => {
          return el.name === nodeName;
        }) ?? null;

      contextNode = newContextNode;
    });

    return contextNode;
  }

  findChildrenNamed(name: string): TreeNode[] {
    if (name.includes("/")) {
      console.error(
        "ERROR - do you want to use more than one level for findChildrenNamed? Use findTextFromChildNamed."
      );
      console.log(name);
      debugger;
    }

    const foundTreeNodes: TreeNode[] = [];

    this.children.forEach((el) => {
      if (el.name === name) {
        foundTreeNodes.push(el);
      }
    });

    return foundTreeNodes;
  }

  computeText(): string | null {
    const textParts: string[] = [];
    if (this.text === null) {
      if (this.children.length === 0) {
        return null;
      }
      this.children.forEach((child) => {
        const childText = child.computeText();
        if (childText) {
          textParts.push(childText);
        }
      });
    } else {
      textParts.push(this.text);
    }

    return textParts.join(' ');
  }
}
