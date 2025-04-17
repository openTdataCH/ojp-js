import { XMLElement } from 'xmlbuilder';

import { TreeNode } from '../xml/tree-node';
import { XML_Config } from '../types/_all';

interface PublicTransportSubMode {
  key: string
  value: string
}

export class PublicTransportMode {
  public ptMode: string
  public subMode: PublicTransportSubMode | null
  public name: string | null
  public shortName: string | null
  public isDemandMode: boolean

  constructor(ptMode: string, subMode: PublicTransportSubMode | null, name: string | null, shortName: string | null) {
    this.ptMode = ptMode;
    this.subMode = subMode;
    this.name = name;
    this.shortName = shortName;
    this.isDemandMode = false;
  }

  public static initWithServiceTreeNode(serviceTreeNode: TreeNode): PublicTransportMode | null {
    const ptModeNode = serviceTreeNode.findChildNamed('Mode');
    if (ptModeNode === null) {
      return null;
    }
    
    const ptModeS = ptModeNode.findTextFromChildNamed('PtMode');
    if (ptModeS === null) {
      return null;
    }

    let subMode: PublicTransportSubMode | null = null;
    const subModeNode = ptModeNode.children.find(el => el.name.toLowerCase().endsWith('submode')) ?? null;
    if (subModeNode !== null) {
      subMode = {
        key: subModeNode.name.replace('siri:', ''),
        value: subModeNode.text ?? 'subMode text n/a',
      };
    }

    const name = serviceTreeNode.findTextFromChildNamed('Mode/Name/Text');
    const shortName = serviceTreeNode.findTextFromChildNamed('Mode/ShortName/Text');
    const publicTransportMode = new PublicTransportMode(ptModeS, subMode, name, shortName);

    const busSubmode = serviceTreeNode.findTextFromChildNamed('Mode/siri:BusSubmode')
    // TODO - do we still need this?
    // publicTransportMode.isDemandMode = busSubmode !== null;
    publicTransportMode.isDemandMode = (busSubmode === 'demandAndResponseBus' || busSubmode === 'unknown');

    return publicTransportMode;
  }

  public isRail(): boolean {
    return this.ptMode === 'rail';
  }

  public hasPrecisePolyline(): boolean {
    if (this.isDemandMode) {
      return true;
    }

    const ignorePtModes: string[] = [
      'bus',
      'tram'
    ];
    if (ignorePtModes.indexOf(this.ptMode) !== -1) {
      return false;
    }

    return true;
  }

  public addToXMLNode(parentNode: XMLElement, xmlConfig: XML_Config) {
    const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
    const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';

    const modeNode = parentNode.ele(ojpPrefix + 'Mode');
    modeNode.ele(ojpPrefix + 'PtMode', this.ptMode);
    
    if (this.name) {
      modeNode.ele(ojpPrefix + 'Name').ele(ojpPrefix + 'Text', this.name);
    }

    if (this.shortName) {
      modeNode.ele(ojpPrefix + 'ShortName').ele(ojpPrefix + 'Text', this.shortName);
    }
  }
}
