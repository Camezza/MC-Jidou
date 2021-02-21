import { Vec3 } from "vec3";

/*
// Best First Search
*/

/*
// - Serves as the primary algorithm for determining how to go places
// - Designed to be a standalone plugin
*/

// Reasons for why pathfinding has stopped
// - error: An error has occured
// - interrupt: Pathfinding has been stopped either manually or by starting another instance
// - failure: No path could be found
// - success: A path was found
type callback_reason = 'error' | 'interrupt' | 'failure' | 'success';

// A node object used for comparison & pathing. Can optionally store data
interface node {
    position: Vec3,
    identifier: string,
    data?: Record<string, any>,
}

// Options required for the algorithm
interface options {
    start: node,
    isDestination: (destination_node: node) => boolean,
    getAdjacent: (current_node: node) => node[],
    getHeuristic: (current_node: node) => number,
    getMovementCost: (node_A: node, node_B: node) => number,
}

interface path_data {
    status: callback_reason,
    path?: node[],
}

// Main class
export class BFS {
    private start: node;
    private isDestination: (destination_node: node) => boolean;
    private getAdjacent: (current_node: node) => node[];
    private getHeuristic: (current_node: node) => number;
    private getMovement: (node_A: node, node_B: node) => number;

    // Changed when pathfinder is evoked
    public cancelPath: () => void;

    constructor(options: options) {
        this.start = options.start;
        this.isDestination = options.isDestination;
        this.getAdjacent = options.getAdjacent;
        this.getHeuristic = options.getHeuristic;
        this.getMovement = options.getMovementCost;
        this.cancelPath = () => {};
    }

    // Runs callback when a path has been found.
    public async retreivePath(callback: (reason: callback_reason, path?: node[]) => void) {
        this.cancelPath(); // cancel ongoing operations
        let data = await this.calculatePath(); // asyncronously find a path
        callback(data.status, data.path); // run callback once finished
    }

    // Find a path from point A to B
    private async calculatePath(): Promise<path_data> {
        return new Promise<path_data>(
            (resolve) => {

                // Stops pathfinding and returns a status message with the path
                let terminate = (status?: callback_reason, path?: node[]) => {
                    let reason = status || 'interrupt'; // No status specified (Manually stopped)

                    resolve({
                        status: reason,
                        path: path,
                    });
                }

                // Initialisation
                let path: node[] = [];
                let current_node = this.start;
                let adjacent_nodes = this.getAdjacent(current_node); // get the initial adjacent nodes
                this.cancelPath = terminate; // update termination method

                // Keep repeating until there are no moves left or a path has been found
                while (adjacent_nodes.length > 0 && !this.isDestination(current_node)) {

                }
            });
    }
}