import { XMLElement } from 'xmlbuilder';

import { TreeNode } from '../xml/tree-node';

type PublicTransportPictogram = 'picto-bus' | 'picto-railway' | 'picto-tram' | 'picto-rack-railway' | 'picto-funicular' | 'picto-cablecar' | 'picto-gondola' | 'picto-chairlift' | 'picto-boat' | 'car-sharing' | 'picto-bus-fallback';

export class PublicTransportMode {
  public ptMode: string
  public name: string | null
  public shortName: string | null
  public isDemandMode: boolean

  constructor(ptMode: string, name: string | null, shortName: string | null) {
    this.ptMode = ptMode
    this.name = name
    this.shortName = shortName
    this.isDemandMode = false
  }

  public static initWithServiceTreeNode(serviceTreeNode: TreeNode): PublicTransportMode | null {
    const ptMode = serviceTreeNode.findTextFromChildNamed('Mode/PtMode');
    if (ptMode === null) {
      return null;
    }

    const name = serviceTreeNode.findTextFromChildNamed('Mode/Name/Text');
    const shortName = serviceTreeNode.findTextFromChildNamed('Mode/ShortName/Text');
    const publicTransportMode = new PublicTransportMode(ptMode, name, shortName);

    const busSubmode = serviceTreeNode.findTextFromChildNamed('Mode/siri:BusSubmode')
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

    const ignorePtPictograms: PublicTransportPictogram[] = [
      'picto-bus',
      'picto-bus-fallback',
      'picto-tram'
    ];

    const ptPictogram = this.computePublicTransportPictogram();
    if (ignorePtPictograms.indexOf(ptPictogram) === -1) {
      return true;
    }

    return false;
  }

  public computePublicTransportPictogram(): PublicTransportPictogram {
    if (this.ptMode === 'bus') {
      return 'picto-bus';
    }

    if (this.isRail()) {
      return 'picto-railway';
    }

    if (this.ptMode === 'tram') {
      return 'picto-tram';
    }

    // ojp:PtMode === funicular
    if (this.shortName === 'CC') {
      return 'picto-rack-railway';
    }
    
    // ojp:PtMode === telecabin
    if (this.shortName === 'FUN') {
      return 'picto-funicular';
    }
    if (this.shortName === 'PB') {
      return 'picto-cablecar';
    }
    if (this.shortName === 'GB') {
      return 'picto-gondola';
    }
    if (this.shortName === 'SL') {
      return 'picto-chairlift';
    }

    if (this.ptMode === 'water') {
      return 'picto-boat';
    }

    if (this.isDemandMode) {
      return 'car-sharing';
    }

    return 'picto-bus-fallback';
  }

  public addToXMLNode(parentNode: XMLElement) {
    const modeNode = parentNode.ele('ojp:Mode');
    modeNode.ele('ojp:PtMode', this.ptMode);
    
    if (this.name) {
      modeNode.ele('ojp:Name').ele('ojp:Text', this.name);
    }

    if (this.shortName) {
      modeNode.ele('ojp:ShortName').ele('ojp:Text', this.shortName);
    }
  }
}
