import { XMLBuilder } from "fast-xml-parser";
import { MapModelKeepPropertiesXML, MapNS_Tags } from "../../types/openapi/openapi-dependencies.js";

// TODO - keep it abstract, handle the callback if needed
function transformKeys<T extends Record<string, any>>(obj: T, callback:(key: string, value: any, path: string[]) => string, path: string[] = []): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = callback(key, value, path);
    const newPath = path.concat([newKey]);

    acc[newKey] = (() => {
      if (value instanceof Object) {
        if (Array.isArray(value)) {
          (value as any[]).forEach((el, idx) => {
            if (el instanceof Object) {
              value[idx] = transformKeys(el, callback, newPath);
            }
          });
        } else {
          return transformKeys(value, callback, newPath);
        }
      }

      return value;
    })();
    
    return acc;
  }, {} as Record<string, any>);
}

export function buildXML(obj: Record<string, any>): string {
  const objCopy = JSON.parse(JSON.stringify(obj));

  const objTransformed = transformKeys(objCopy, (key: string, value: any, path: string[]) => {
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
