export class PublicTransportMode {
    constructor(ptMode, subMode, name, shortName) {
        this.ptMode = ptMode;
        this.subMode = subMode;
        this.name = name;
        this.shortName = shortName;
        this.isDemandMode = false;
    }
    static initWithServiceTreeNode(serviceTreeNode) {
        var _a, _b;
        const ptModeNode = serviceTreeNode.findChildNamed('Mode');
        if (ptModeNode === null) {
            return null;
        }
        const ptModeS = ptModeNode.findTextFromChildNamed('PtMode');
        if (ptModeS === null) {
            return null;
        }
        let subMode = null;
        const subModeNode = (_a = ptModeNode.children.find(el => el.name.toLowerCase().endsWith('submode'))) !== null && _a !== void 0 ? _a : null;
        if (subModeNode !== null) {
            subMode = {
                key: subModeNode.name.replace('siri:', ''),
                value: (_b = subModeNode.text) !== null && _b !== void 0 ? _b : 'subMode text n/a',
            };
        }
        const name = serviceTreeNode.findTextFromChildNamed('Mode/Name/Text');
        const shortName = serviceTreeNode.findTextFromChildNamed('Mode/ShortName/Text');
        const publicTransportMode = new PublicTransportMode(ptModeS, subMode, name, shortName);
        const busSubmode = serviceTreeNode.findTextFromChildNamed('Mode/siri:BusSubmode');
        // TODO - do we still need this?
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
        const ignorePtModes = [
            'bus',
            'tram'
        ];
        if (ignorePtModes.indexOf(this.ptMode) !== -1) {
            return false;
        }
        return true;
    }
    addToXMLNode(parentNode, xmlConfig) {
        const ojpPrefix = xmlConfig.defaultNS === 'ojp' ? '' : 'ojp:';
        const siriPrefix = xmlConfig.defaultNS === 'siri' ? '' : 'siri:';
        const modeNode = parentNode.ele(ojpPrefix + 'Mode');
        modeNode.ele(ojpPrefix + 'PtMode', this.ptMode);
        if (this.subMode) {
            modeNode.ele(siriPrefix + this.subMode.key, this.subMode.value);
        }
        if (this.name) {
            modeNode.ele(ojpPrefix + 'Name').ele(ojpPrefix + 'Text', this.name);
        }
        if (this.shortName) {
            modeNode.ele(ojpPrefix + 'ShortName').ele(ojpPrefix + 'Text', this.shortName);
        }
    }
}
