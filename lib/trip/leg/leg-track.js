import { Location } from "../../location/location";
import { Duration } from "../../shared/duration";
import { LinkProjection } from "../link-projection";
export class LegTrack {
    constructor(trackSections) {
        this.trackSections = trackSections;
        let durationMinutes = 0;
        this.hasGeoData = false;
        trackSections.forEach(trackSection => {
            if (trackSection.linkProjection) {
                this.hasGeoData = true;
            }
            if (trackSection.duration) {
                durationMinutes += trackSection.duration.totalMinutes;
            }
        });
        this.duration = null;
        if (durationMinutes > 0) {
            this.duration = Duration.initFromTotalMinutes(durationMinutes);
        }
    }
    plus(otherLegTrack) {
        if (this.duration !== null && otherLegTrack.duration !== null) {
            this.duration = this.duration.plus(otherLegTrack.duration);
        }
        this.trackSections = this.trackSections.concat(otherLegTrack.trackSections);
        return this;
    }
    static initWithLegTreeNode(treeNode, xmlConfig) {
        const legTrackTreeNode = treeNode.findChildNamed('LegTrack');
        if (legTrackTreeNode === null) {
            return null;
        }
        const trackSections = [];
        const trackSectionTreeNodes = legTrackTreeNode.findChildrenNamed('TrackSection');
        trackSectionTreeNodes.forEach(trackSectionTreeNode => {
            const trackSection = TrackSection.initWithTreeNode(trackSectionTreeNode, xmlConfig);
            if (trackSection) {
                trackSections.push(trackSection);
            }
        });
        const legTrack = new LegTrack(trackSections);
        return legTrack;
    }
    fromGeoPosition() {
        const hasSections = this.trackSections.length === 0;
        if (hasSections) {
            return null;
        }
        const firstLinkProjection = this.trackSections[0].linkProjection;
        if (firstLinkProjection === null) {
            return null;
        }
        return firstLinkProjection.coordinates[0];
    }
    toGeoPosition() {
        const hasSections = this.trackSections.length === 0;
        if (hasSections) {
            return null;
        }
        const lastLinkProjection = this.trackSections[this.trackSections.length - 1].linkProjection;
        if (lastLinkProjection === null) {
            return null;
        }
        return lastLinkProjection.coordinates[lastLinkProjection.coordinates.length - 1];
    }
}
class TrackSection {
    constructor(fromLocation, toLocation) {
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.duration = null;
        this.length = null;
        this.linkProjection = null;
    }
    static initWithTreeNode(treeNode, xmlConfig) {
        const isOJPv2 = xmlConfig.ojpVersion === '2.0';
        const trackStartNodeName = isOJPv2 ? 'TrackSectionStart' : 'TrackStart';
        const trackStartTreeNode = treeNode.findChildNamed(trackStartNodeName);
        const trackEndNodeName = isOJPv2 ? 'TrackSectionEnd' : 'TrackEnd';
        const trackEndTreeNode = treeNode.findChildNamed(trackEndNodeName);
        if (!(trackStartTreeNode && trackEndTreeNode)) {
            return null;
        }
        const fromLocation = Location.initWithTreeNode(trackStartTreeNode, xmlConfig);
        const toLocation = Location.initWithTreeNode(trackEndTreeNode, xmlConfig);
        if (!(fromLocation && toLocation)) {
            console.error('CANT instantiate TrackSection.initWithTreeNode');
            console.log(treeNode);
            return null;
        }
        const trackSection = new TrackSection(fromLocation, toLocation);
        trackSection.duration = Duration.initWithTreeNode(treeNode);
        const linkProjection = LinkProjection.initWithTreeNode(treeNode);
        trackSection.linkProjection = linkProjection;
        const lengthS = treeNode.findTextFromChildNamed('Length');
        if (lengthS === null) {
            if (linkProjection) {
                trackSection.length = linkProjection.computeLength();
            }
        }
        else {
            trackSection.length = parseInt(lengthS, 10);
        }
        return trackSection;
    }
}
