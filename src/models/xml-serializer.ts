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
}
