import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { MapArrayTags, MapModelKeepPropertiesXML, MapNS_Tags, MapParentArrayTags } from "../types/openapi/openapi-dependencies";

const transformTagNameHandler = (tagName: string) => {
  // Convert to camelCase, strip -_
  let newTagName = tagName.replace(/[-_](.)/g, (_, char) => char.toUpperCase()) 
  // Ensure first letter is lowercase
  newTagName = newTagName.replace(/^([A-Z])/, (match) => match.toLowerCase());

  // console.log('transformToCamelCase:   ' + tagName);

  return newTagName;
};

const isArrayHandler = (tagName: string, jPath: string) => {
  // console.log('handleArrayNodes:       ' + tagName +  ' -- ' + jPath);

  const jPathParts = jPath.split('.');
  if (jPathParts.length > 1) {
    const pathPart = jPathParts.slice(-2).join('.');
    if (pathPart in MapArrayTags) {
      return true;
    }
  }

  return false;
};

// TODO - keep it abstract, handle the callback if needed
export function traverseJSON(obj: any, callback: (key: string, value: any, path: string) => void, path: string = '') {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      const newPath: string = (() => {
        if (obj instanceof Array) {
          return path;
        }

        return path + '.' + key;
      })(); 

      callback(key, value, newPath);

      if (typeof value === 'object' && value !== null) {
        traverseJSON(value, callback, newPath);
      }
    }
  }
}

export function parseXML<T>(xml: string, parentPath: string = ''): T {
  let response = parser.parse(xml) as T;
  
  traverseJSON(response, (key: string, value: any, jPath: string) => {
    // console.log(path + ' k: ' + key + ' v: ' + value);
    
    if (typeof value === 'object') {
      
      // enforce empty arrays if the array items are not present
      const jPathParts = jPath.split('.'); 
      if (jPathParts.length > 1) {
        const pathPart = jPathParts.slice(-2).join('.');
        if (pathPart in MapParentArrayTags) {
          const enforceChildTags = MapParentArrayTags[pathPart];
          enforceChildTags.forEach(childTagName => {
            value[childTagName] ??= [];
          });
        }
      }

      // check for #text keys that are added for text nodes that have attributes
      for (const key1 in value) {
        if (typeof value[key1] === 'object') {
          if (Object.keys(value[key1]).includes('#text')) {
            const otherKeys = Object.keys(value[key1]).filter(el => el !== '#text');

            // keep attributes
            otherKeys.forEach(otherKey => {
              const newKey = key1 + otherKey;
              value[newKey] = value[key1][otherKey];
            });
            
            // replace the object with literal value of #text
            value[key1] = value[key1]['#text'];
          }
        }
      }
    }
 }, parentPath);

  return response;
}

// TODO - keep it abstract, handle the callback if needed
function transformKeys<T extends Record<string, any>>(obj: T, callback:(key: string, value: any, path: string[]) => string, path: string[] = []): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = callback(key, value, path);
    const newPath = path.concat([newKey]);

    acc[newKey] = (() => {
      if (value instanceof Object) {
        if (!Array.isArray(value)) {
          return transformKeys(value, callback, newPath);
        }
      }

      return value;
    })();
    
    return acc;
  }, {} as Record<string, any>);
}

export function buildXML(obj: Record<string, any>): string {
  const objTransformed = transformKeys(obj, (key: string, value: any, path: string[]) => {
    // capitalize first letter
    let newKey = key.charAt(0).toUpperCase() + key.slice(1);

    const keysToKeep = MapModelKeepPropertiesXML[key] ?? null;
    if (keysToKeep !== null) {
      if (typeof value === 'object') {
        const objKeys = Object.keys(value);
        objKeys.forEach(objKey => {
          if (keysToKeep.includes(objKey)) {
            return;
          }

          // remove keys that are not in XSD
          delete(value[objKey]);
        });
      }
    }
    
    // ensure namespaces
    const parentKey = path.at(-1) ?? null;
    if (parentKey !== null) {
      const tagNS_Key = parentKey.replace(/^.*:/, '') + '.' + newKey;
      const tagNS = MapNS_Tags[tagNS_Key] ?? null;

      if (tagNS !== null) {
        newKey = tagNS + ':' + newKey;
      }
    }

    return newKey;
  }, ['OJP']);

  const options = {
    format: true, 
    ignoreAttributes: false,
    suppressEmptyNode: true,
  };
  const builder = new XMLBuilder(options);
  const xmlParts = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">',
    builder.build(objTransformed),
    '</OJP>',
  ];

  const xmlS = xmlParts.join('\n');

  return xmlS;
}

// Configure the parser to remove namespace prefixes
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  transformTagName: transformTagNameHandler,
  isArray: isArrayHandler,
});
