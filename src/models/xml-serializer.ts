import { DefaultXML_Config } from "../constants";
import { buildXML } from "../helpers/xml/builder";
import { XML_Config } from "../types/_all";

/**
 * Serializes JavaScript objects to XML format with configurable options.
 * 
 * The XmlSerializer provides methods to convert JavaScript objects into XML strings
 * using a configurable XML configuration. It includes automatic tag name transformation
 * to handle different naming conventions.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const serializer = new XmlSerializer();
 * const xmlString = serializer.serialize({ 
 *   name: "John", 
 *   age: 30 
 * }, "person");
 * 
 * // With custom configuration
 * const customConfig = {
 *   indent: '  ',
 *   newline: '\n'
 * };
 * const serializerWithConfig = new XmlSerializer(customConfig);
 * ```
 * 
 * @category XML Utils
 */
export class XmlSerializer {
  public xmlConfig: XML_Config;

  constructor(xmlConfig: XML_Config = DefaultXML_Config) {
    this.xmlConfig = xmlConfig;
  }

  /**
   * Serializes a JavaScript object to XML format
   * 
   * @param obj - The object to serialize
   * @param wrapperNodeName - The name of the root XML element
   * @returns XML string representation of the object
   * 
   * @example
   * ```typescript
   * const serializer = new XmlSerializer();
   * const xml = serializer.serialize({ 
   *   firstName: "John", 
   *   lastName: "Doe" 
   * }, "person");
   * // Returns: '<person><firstName>John</firstName><lastName>Doe</lastName></person>'
   * ```
   * 
   */
  public serialize(obj: Record<string, any>, wrapperNodeName: string): string {
    const xml = buildXML(obj, wrapperNodeName, this.xmlConfig);
    return xml;
  }

  /**
   * Transforms a tag name to camelCase format for XML serialization
   * 
   * This method handles special cases like OJP prefixes and preserves uppercase-only tags.
   * It converts hyphenated or underscored names to camelCase while ensuring the first
   * character is lowercase.
   * 
   * @param tagName - The original tag name to transform
   * @returns Transformed tag name in camelCase format
   * 
   * @example
   * ```typescript
   * // Transform various tag name formats
   * XmlSerializer.transformTagName('OJP_Feature'); // Returns: 'OJP_Feature'
   * XmlSerializer.transformTagName('FIRST_NAME');  // Returns: 'FIRST_NAME' 
   * XmlSerializer.transformTagName('first-name');  // Returns: 'firstName'
   * XmlSerializer.transformTagName('user_name');   // Returns: 'userName'
   * ```
   */
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
