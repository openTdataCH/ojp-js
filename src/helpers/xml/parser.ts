import * as OJP_Types from 'ojp-shared-types';

import { XMLParser } from "fast-xml-parser";
import { XmlSerializer } from '../../models/xml-serializer';

const mapArrayTags: Record<string, boolean> = Object.assign({}, OJP_Types.OpenAPI_Dependencies.MapArrayTags);

const mapLegacyArrayTags: Record<string, boolean> = Object.assign({}, OJP_Types.OpenAPI_Dependencies.MapArrayTags);
for (const key in OJP_Types.OpenAPI_Dependencies.MapLegacyArrayTags) {
  mapLegacyArrayTags[key] = OJP_Types.OpenAPI_Dependencies.MapLegacyArrayTags[key];
}

function computeMapParentArrayTags(mapArrayTags: Record<string, boolean>): Record<string, string[]> {
  const mapParentArrayTags: Record<string, string[]> = {};
  for (const key in mapArrayTags) {
    const keyParts = key.split('.');
    if (keyParts.length !== 2) {
      console.error('invalid OpenAPI_Dependencies.MapArrayTags key: ' + key);
      continue;
    }

    const parentTagName = keyParts[0];
    const childTagName = keyParts[1];

    if (!(parentTagName in mapParentArrayTags)) {
      mapParentArrayTags[parentTagName] = [];
    }

    mapParentArrayTags[parentTagName].push(childTagName);
  }

  return mapParentArrayTags;
}

const MapParentArrayTags = computeMapParentArrayTags(mapArrayTags);
const MapLegacyParentArrayTags = computeMapParentArrayTags(mapLegacyArrayTags);
  const hashTextKey = '#text';

  function isHashKeyObject(v: unknown): v is Record<string, unknown> {
    if ((typeof v) !== 'object') {
      return false;
    }
    if (Array.isArray(v)) {
      return false;
    }

    const hasKey = hashTextKey in (v as any);

    return hasKey;
  }

  function normalizeValue(value: unknown, path: string[]): unknown {
    if (path.length < 2) {
      return value;
    }

    const pathSuffix = path.slice(-2).join('.');

    if ((pathSuffix in OJP_Types.OpenAPI_Dependencies.MapStringValues) && (typeof(value) !== 'string')) {
      return String(value);
    }

    return value;
  }

  function visit(node: unknown, path: string[]): void {
    const currentNodeKey = path.at(-1);

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        visit(node[i], path);
      }
      return;
    }

    // Objects
    if (node && typeof node === 'object') {
      const rec = node as Record<string, unknown>;
      const keys = Object.keys(rec);

      for (const key of keys) {
        let value = rec[key];
        const valuePath = [...path, key];

        // Case 1: check for #text property values
        if (isHashKeyObject(value)) {
          const inner = value as Record<string, unknown>;

          // hashTextKey -> main value for prop1
          rec[key] = inner[hashTextKey];

          // other props -> 'prop1.other', etc.
          for (const innerKey of Object.keys(inner)) {
            if (innerKey === hashTextKey) {
              continue;
            }
            const flatKey = `${key}.${innerKey}`;
            rec[flatKey] = inner[innerKey];
          }

          // Do NOT recurse into old inner object; we've flattened it
          continue;
        }

        // Case 2: if arrays, check for #text property values in the children
        if (Array.isArray(value) && value.length > 0 && value.every(isHashKeyObject)) {
          const arr = value as Array<Record<string, unknown>>;
          const basePath = valuePath; // path to prop1

          // prop1 -> array of normalized hashTextKey values
          rec[key] = arr.map(o => normalizeValue(o[hashTextKey], basePath));

          // collect extra keys
          const extraKeys = new Set<string>();
          for (const o of arr) {
            for (const k of Object.keys(o)) {
              if (k !== hashTextKey) {
                extraKeys.add(k);
              }
            }
          }

          // prop1.other -> array of normalized 'other' values
          for (const extraKey of extraKeys) {
            const flatKey = `${key}.${extraKey}`;
            // no need to normalize attributes to strings
            rec[flatKey] = arr.map(o => o[extraKey]);
          }

          continue;
        }

        // Normal property: normalize then recurse
        value = normalizeValue(value, valuePath);
        rec[key] = value;
        visit(value, valuePath);
      }

      // Enforce arrays, create empty nodes if needed
      if (currentNodeKey !== undefined) {
        const expectedPropAsArray = MapParentArrayTags[currentNodeKey] ?? [];
        expectedPropAsArray.forEach(prop => {
          if (!(prop in rec)) {
            rec[prop] = [];
          }
          // NOTE for later: do not try to enforce an array of an existing property
          //      this was handled in the parsing via isArrayHandler.
          //      MapParentArrayTags has low granularity
        });
      }
    }
  }

  visit(root, []);
}

const transformTagNameHandler = (tagName: string) => {
  return XmlSerializer.transformTagName(tagName);
};

const isArrayHandler = (tagName: string, jPath: string) => {
  const jPathParts = jPath.split('.');
  if (jPathParts.length >= 2) {
    const pathPart = jPathParts.slice(-2).join('.');
    if (pathPart in OJP_Types.OpenAPI_Dependencies.MapArrayTags) {
      return true;
    }
  }

  return false;
};

export function parseXML<T>(xml: string, parentPath: string = ''): T {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    transformTagName: transformTagNameHandler,
    isArray: isArrayHandler,
    // parseTagValue: false,
  });

  const response = parser.parse(xml) as T;
  transformJsonInPlace(response);

  return response;
}
