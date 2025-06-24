import * as OJP_Types from 'ojp-shared-types';

import { XMLParser } from "fast-xml-parser";

const MapParentArrayTags: Record<string, string[]> = {};
for (const key in OJP_Types.OpenAPI_Dependencies.MapArrayTags) {
  const keyParts = key.split('.');
  if (keyParts.length !== 2) {
    console.error('invalid OpenAPI_Dependencies.MapArrayTags key: ' + key);
    continue;
  }

  const parentTagName = keyParts[0];
  const childTagName = keyParts[1];

  if (!(parentTagName in MapParentArrayTags)) {
    MapParentArrayTags[parentTagName] = [];
  }

  MapParentArrayTags[parentTagName].push(childTagName);
}

const transformTagNameHandler = (tagName: string) => {
  if (tagName.startsWith('OJP')) {
    return tagName;
  }

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
  if (jPathParts.length >= 2) {
    const pathPart = jPathParts.slice(-2).join('.');
    if (pathPart in OJP_Types.OpenAPI_Dependencies.MapArrayTags) {
      return true;
    }
  }

  return false;
};

function traverseJSON(obj: any, path: string[], callback: (key: string, value: any, path: string[]) => void) {
  if ((typeof obj !== 'object') || (obj === null)) {
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      traverseJSON(item, path, callback);
    }
  } else {
    for (const key in obj) {
      const newPath = path.slice();
      newPath.push(key);

      callback(key, obj[key], newPath);

      traverseJSON(obj[key], newPath, callback);
    }
  }
}

export function parseXML<T>(xml: string, parentPath: string = ''): T {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    transformTagName: transformTagNameHandler,
    isArray: isArrayHandler,
    // parseTagValue: false,
  });

  const response = parser.parse(xml) as T;

  traverseJSON(response, [parentPath], (key: string, value: any, path: string[]) => {
    // console.log('traverseJSON_> ' + path.join('.') + ' k: ' + key + ' v: ' + value);
    
    if (typeof value === 'object') {    
      // enforce empty arrays if the array items are not present
      if (path.length >= 2) {
        if (key in MapParentArrayTags) {
          const enforceChildTags = MapParentArrayTags[key];
          if (Array.isArray(value)) {
            value.forEach(childValue => {
              enforceChildTags.forEach(childTagName => {
                childValue[childTagName] ??= [];
              });
            });
          } else {
            enforceChildTags.forEach(childTagName => {
              value[childTagName] ??= [];
            });
          }
        }
      }

      for (const key1 in value) {
        if (typeof value[key1] === 'object') {
          // check for #text keys that are added for text nodes that have attributes
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

        // for .text properties we need the before step (#text parsing) to be executed first
        const lastItem = (path.at(-1) ?? '');
        const stringKey = lastItem + '.' + key1;
        if (stringKey in OJP_Types.OpenAPI_Dependencies.MapStringValues) {
          // fast-xml-parser attempts to converts everything
          //    conform to schema id needed, i.e. String values
          value[key1] = String(value[key1]);
        }
      }
    }
  });
  
  return response;
}
