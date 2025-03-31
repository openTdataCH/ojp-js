import { XMLParser } from "fast-xml-parser";
import { MapArrayTags, MapParentArrayTags } from "../../types/openapi/openapi-dependencies";

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
function traverseJSON(obj: any, callback: (key: string, value: any, path: string) => void, path: string = '') {
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

// Configure the parser to remove namespace prefixes
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  transformTagName: transformTagNameHandler,
  isArray: isArrayHandler,
});