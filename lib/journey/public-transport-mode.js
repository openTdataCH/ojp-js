export class PublicTransportMode {
    constructor(ptMode, name, shortName) {
        this.ptMode = ptMode;
        this.name = name;
        this.shortName = shortName;
        this.isDemandMode = false;
    }
    static initWithServiceTreeNode(serviceTreeNode) {
        const ptMode = serviceTreeNode.findTextFromChildNamed('Mode/PtMode');
        if (ptMode === null) {
            return null;
        }
        const name = serviceTreeNode.findTextFromChildNamed('Mode/Name/Text');
        const shortName = serviceTreeNode.findTextFromChildNamed('Mode/ShortName/Text');
        const publicTransportMode = new PublicTransportMode(ptMode, name, shortName);
        const busSubmode = serviceTreeNode.findTextFromChildNamed('Mode/siri:BusSubmode');
        // publicTransportMode.isDemandMode = busSubmode !== null;
        publicTransportMode.isDemandMode = (busSubmode === 'demandAndResponseBus' || busSubmode === 'unknown');
        return publicTransportMode;
    }
    isRail() {
        return this.ptMode === 'rail';
    }
    hasPrecisePolyline() {
        if (this.isDemandMode) {
            return true;
        }
        const ignorePtPictograms = [
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
    computePublicTransportPictogram() {
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
    addToXMLNode(parentNode) {
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
