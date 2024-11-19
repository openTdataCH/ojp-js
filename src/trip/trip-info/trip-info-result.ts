import { DEBUG_LEVEL } from "../../constants";
import { DataHelpers } from "../../helpers/data-helpers";
import { JourneyService } from "../../journey/journey-service";
import { Location } from "../../location/location";
import { TreeNode } from "../../xml/tree-node";
import { StopPoint } from "../leg/timed-leg/stop-point";

interface TripInfoResultMetadata {
    transportTypeName: string,
    publishedJourneyNumber: string,
    operatorName: string
}

export class TripInfoResult {
    public stopPoints: StopPoint[];
    public service: JourneyService;
    public metadata: TripInfoResultMetadata

    constructor(stopPoints: StopPoint[], service: JourneyService, metadata: TripInfoResultMetadata) {
        this.stopPoints = stopPoints;
        this.service = service;
        this.metadata = metadata
    }

    public static initFromTreeNode(treeNode: TreeNode): TripInfoResult | null {
        const serviceNode = treeNode.findChildNamed('Service');
        if (serviceNode === null) {
            console.error('TripInfoResult.initFromTreeNode: no service node found');
            console.log(treeNode);

            return null;
        }
        const service = JourneyService.initWithTreeNode(treeNode);
        if (service === null) {
            console.error('JourneyService.initFromTreeNode: cant init service');
            console.log(serviceNode);

            return null;
        }

        const previousCallNodes = treeNode.findChildrenNamed('PreviousCall');
        const onwardCallNodes = treeNode.findChildrenNamed('OnwardCall');

        const callNodes = previousCallNodes.concat(onwardCallNodes);
    
        const stopPoints: StopPoint[] = [];
        callNodes.forEach(callNode => {
            const stopPoint = StopPoint.initWithTreeNode(callNode, 'Intermediate');
            if (stopPoint !== null) {
                stopPoints.push(stopPoint);
            }
        });
        if (stopPoints.length < 2) {
            console.error('TripInfoResult.initFromTreeNode: expected minimum 2 stops');
            console.log(treeNode);

            return null;
        }

        const metadata: TripInfoResultMetadata = {
            transportTypeName: treeNode.findTextFromChildNamed('Extension/TransportTypeName/Text') ?? 'TransportTypeName n/a',
            publishedJourneyNumber: treeNode.findTextFromChildNamed('Extension/PublishedJourneyNumber/Text') ?? 'PublishedJourneyNumber n/a',
            operatorName: treeNode.findTextFromChildNamed('Extension/OperatorName/Text') ?? 'OperatorName n/a',
        };

        const tripInfoResult = new TripInfoResult(stopPoints, service, metadata);

        return tripInfoResult;
    }

    public patchLocations(mapContextLocations: Record<string, Location>) {
        this.stopPoints.forEach(stopPoint => {
            let stopPlaceRef = stopPoint.location.stopPlace?.stopPlaceRef ?? null;
            if (stopPlaceRef === null) {
                if (DEBUG_LEVEL === 'DEBUG') {
                    console.error('TripInfoResult.patchLocations - no stopPlaceRef found in location');
                    console.log(stopPoint);
                }
                return;
            }

            if (!(stopPlaceRef in mapContextLocations)) {
                // For StopPoint try to get the StopPlace
                // see https://github.com/openTdataCH/ojp-sdk/issues/97
                stopPlaceRef = DataHelpers.convertStopPointToStopPlace(stopPlaceRef);
            }

            if (!(stopPlaceRef in mapContextLocations)) {
                if (DEBUG_LEVEL === 'DEBUG') {
                    console.error('TripInfoResult.patchLocations - no stopPlaceRef found in mapContextLocations');
                    console.log('stopPoint:');
                    console.log(stopPoint);
                    console.log('mapContextLocations:');
                    console.log(mapContextLocations);
                }
                return;
            }

            const contextLocation = mapContextLocations[stopPlaceRef];
            stopPoint.location.patchWithAnotherLocation(contextLocation);
        });
    }
}
