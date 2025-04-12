import { XMLBuilder } from "fast-xml-parser";
import { MapModelKeepPropertiesXML, MapNS_Tags } from "../../types/openapi/openapi-dependencies";
import { XML_Config } from "../../types/_all";
import { DefaultXML_Config } from "../../constants";

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

export function buildXML(obj: Record<string, any>, xmlConfig: XML_Config = DefaultXML_Config, callbackTransformedObj: ((obj: Record<string, any>) => void) | null = null): string {
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
      const tagNS = (() => {
        const tagNS = MapNS_Tags[tagNS_Key] ?? 'ojp';
        if (xmlConfig.defaultNS === tagNS) {
          return '';
        }

        return tagNS + ':';
      })();

      if (tagNS !== null) {
        newKey = tagNS + newKey;
      }
    }

    return newKey;
  }, ['OJP']);

  if (callbackTransformedObj) {
    callbackTransformedObj(objTransformed);
  }

  const options = {
    format: true, 
    ignoreAttributes: false,
    suppressEmptyNode: true,
  };
  const builder = new XMLBuilder(options);

  const xmlAttrs: string[] = [];
  for (const ns in xmlConfig.mapNS) {
    const url = xmlConfig.mapNS[ns];
    const attrNS = ns === xmlConfig.defaultNS ? 'xmlns' : ('xmlns:' + ns);
    const xmlAttr = attrNS + '="' + url + '"';
    xmlAttrs.push(xmlAttr);
  }

  const xmlVersionAttr = 'version="' + xmlConfig.version + '"';
  xmlAttrs.push(xmlVersionAttr);

  const xmlParts = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<OJP ' + xmlAttrs.join(' ') + '>',
    builder.build(objTransformed),
    '</OJP>',
  ];

  const xmlS = xmlParts.join('\n');

  return xmlS;
}
