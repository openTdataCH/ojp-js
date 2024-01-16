import * as GeoJSON from 'geojson'

import { GeoPosition } from "../location/geoposition";
import { GeoPositionBBOX } from "../location/geoposition-bbox";
import { TreeNode } from '../xml/tree-node';

export class LinkProjection {
  public coordinates: GeoPosition[];
  public bbox: GeoPositionBBOX;
  // TODO - add length or computeLength()

  constructor(coordinates: GeoPosition[], bbox: GeoPositionBBOX) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public static initWithTreeNode(treeNode: TreeNode): LinkProjection | null {
    const linkProjectionTreeNode = treeNode.findChildNamed('ojp:LinkProjection');
    if (linkProjectionTreeNode === null) {
      return null;
    }

    const coordinates: GeoPosition[] = [];

    const positionTreeNodes = linkProjectionTreeNode.findChildrenNamed('ojp:Position');
    positionTreeNodes.forEach(positionTreeNode => {
      const longitudeS = positionTreeNode.findTextFromChildNamed('siri:Longitude');
      const latitudeS = positionTreeNode.findTextFromChildNamed('siri:Latitude');

      if (longitudeS && latitudeS) {
        const position = new GeoPosition(
          parseFloat(longitudeS),
          parseFloat(latitudeS),
        )

        coordinates.push(position);
      }
    });

    if (coordinates.length < 2) {
      return null;
    }

    const bbox = new GeoPositionBBOX(coordinates)

    const linkProjection = new LinkProjection(coordinates, bbox);
    
    return linkProjection;
  }

  public computeLength(): number {
    let distAB = 0;

    this.coordinates.forEach((geoPositionB, idx) => {
      if (idx === 0) {
        return;
      }

      const geoPositionA = this.coordinates[idx - 1];
      distAB += geoPositionB.distanceFrom(geoPositionA);
    });

    return distAB;
  }

  asGeoJSONFeature(): GeoJSON.Feature<GeoJSON.LineString> {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      bbox: this.bbox.asFeatureBBOX(),
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }

    this.coordinates.forEach(geoPosition => {
      const pointCoords = [geoPosition.longitude, geoPosition.latitude];
      feature.geometry.coordinates.push(pointCoords)
    })

    return feature
  }
}
