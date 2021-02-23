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
type node_data = Record<any, any>;

interface path_data {
    status: callback_reason,
    path?: node[],
}

// Options required for the algorithm
interface options {
    isDestination: (data: node_data) => boolean,
    getAdjacent: (data: node_data) => node_data[],
    getHeuristic: (data: node_data) => number,
    getMovementCost: (data_A: node_data, data_B: node_data) => number,
    getIdentifier: (data: node_data) => string,
}

// A node object used for comparison & pathing. Can optionally store data
export class node {
    public identifier: string;
    public parent?: string;
    public data?: node_data;

    constructor(identifier: string, data?: node_data) {
        this.identifier = identifier;
        this.data = data;
    }

    // Sets the parent node
    public setParent(parent: string) {
        this.parent = parent;
    }
}

// Main class
export class BFS {

    // ToDo: Have these functions take data instead of nodes as parameters.
    // This plugin should be assigning node values internally
    private isDestination: (data: node_data) => boolean;
    private getAdjacent: (data: node_data) => node_data[]; // change this later on
    private getHeuristic: (data: node_data) => number;
    private getMovement: (data_A: node_data, data_B: node_data) => number;
    private getIdentifier: (data: node_data) => string;

    // Changed when pathfinder is evoked
    public cancelPath: () => void;

    constructor(options: options) {
        this.isDestination = options.isDestination;
        this.getIdentifier = options.getIdentifier;
        this.getAdjacent = options.getAdjacent;
        this.getHeuristic = options.getHeuristic;
        this.getMovement = options.getMovementCost;
        this.cancelPath = () => {};
    }

    // Runs callback when a path has been found.
    public async retreivePath(start: node_data, callback: (reason: callback_reason, path?: node[]) => void) {
        this.cancelPath(); // cancel ongoing operations
        let data = await this.calculatePath(start); // asyncronously find a path
        callback(data.status, data.path); // run callback once finished
    }

    // Find a path from point A to B
    private async calculatePath(start: node_data): Promise<path_data> {
        return new Promise<path_data>(
            (resolve) => {

                // Stops pathfinding and returns a status message with the path
                function terminate(status?: callback_reason, path?: node[]) {
                    let reason = status || 'interrupt'; // No status specified (Manually stopped)

                    resolve({
                        status: reason,
                        path: path || [],
                    });
                }

                // Initialisation
                let path: node[] = [];
                let open_list = [];
                let closed_list = [];
                let node_list: Record<string, string> = {};
                let current_node = new node(this.getIdentifier(start), start); // start should be specified as a parameter; not in the plugin initialisation
                let adjacent_node_data = this.getAdjacent(current_node); // get the initial adjacent nodes
                this.cancelPath = terminate; // update termination method

                // Keep repeating until there are no moves left or a path has been found
                // ToDo: while openlist still has nodes
                // 1. Add adjacent to open list.
                // 2. Find the node with the smallest h+g.
                // 3. Add that node to the closed list
                do 
                {
                    closed_list.push(current_node.identifier);
                    let adjacent_nodes = this.retreiveAdjacentNodes(current_node, adjacent_node_data);
                
                } while (open_list.length > 0 && !this.isDestination(current_node));

                // Generate a path by backtracking the final node

                terminate(path.length > 0 ? 'success' : 'failure', path); // success if a path was generated
            });
    }

    private retreiveAdjacentNodes(current_node: node, adjacent_node_data: node_data[]): node[] {
        let adjacent_nodes = [];

        for (let data of adjacent_node_data) {
            let adjacent_node = new node(this.getIdentifier(data), data);
            adjacent_node.setParent(current_node.identifier);
            adjacent_nodes.push(adjacent_node);
        }

        return adjacent_nodes;
    }
}