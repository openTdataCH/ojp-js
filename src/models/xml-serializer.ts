import { DefaultXML_Config } from "../constants";
import { buildXML } from "../helpers/xml/builder";
import { XML_Config } from "../types/_all";

export class XmlSerializer {
  public xmlConfig: XML_Config;

  constructor(xmlConfig: XML_Config = DefaultXML_Config) {
    this.xmlConfig = xmlConfig;
  }

  public serialize(obj: Record<string, any>, wrapperNodeName: string): string {
    const xml = buildXML(obj, wrapperNodeName, this.xmlConfig);
    return xml;
  }

  public static transformTagName(tagName: string) {
    if (tagName.startsWith('OJP')) {
      return tagName;
    }

    // Leave unchanged all UPPERCASE only tags 
    if (tagName.toUpperCase() === tagName) {
      return tagName;
    }

    // Convert to camelCase, strip -_
    let newTagName = tagName.replace(/[-_](.)/g, (_, char) => char.toUpperCase()) 
    // Ensure first letter is lowercase
    newTagName = newTagName.replace(/^([A-Z])/, (match) => match.toLowerCase());

    // console.log('transformToCamelCase:   ' + tagName + '->' + newTagName);

    return newTagName;
  }
}
