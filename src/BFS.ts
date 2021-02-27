/*
// Pathfinder
*/

/*
// - Serves as the primary algorithm for determining how to go places
// - Designed to be a standalone plugin
*/

// Reasons for why pathfinding has stopped
// - failure: No path could be found
// - interrupt: Pathfinding has been stopped either manually or by starting another instance
// - incomplete: No more spaces to move, will retreive the path of the closest node to destination
// - success: A path was found
type callback_reason = 'failure' | 'interrupt' | 'incomplete' | 'success';
type evaluation_type = 'greedy' | 'standard';
type node_data = Record<any, any>;

interface path_data {
    status: callback_reason,
    path?: node[],
}

interface options {
    isDestination: (data: node_data) => boolean,
    getAdjacent: (data: node_data) => node_data[],
    getHeuristic: (data: node_data) => number, // Best to use chebychev heuristic
    getMovement: (data: node_data) => number,
    getIdentifier: (data: node_data) => string,
    evaluation: evaluation_type,
}

// A node object used for comparison & pathing. Can optionally store data
export class node {
    public identifier: string;
    public heuristic: number;
    public cost: number;
    public parent?: string;
    public data?: node_data;

    constructor(identifier: string, heuristic: number, cost: number, data?: node_data) {
        this.identifier = identifier;
        this.heuristic = heuristic;
        this.cost = cost;
        this.data = data;
    }

    public setParent(parent: string) {
        this.parent = parent;
    }
}

export class BFS {
    private isDestination: (data: node_data) => boolean;
    private getAdjacent: (data: node_data) => node_data[];
    private getHeuristic: (data: node_data) => number;
    private getMovement: (data: node_data) => number;
    private getIdentifier: (data: node_data) => string;
    private evaluation: evaluation_type;

    // Changed when pathfinder is evoked
    public cancelPath: () => void;

    constructor(options: options) {
        this.isDestination = options.isDestination;
        this.getIdentifier = options.getIdentifier;
        this.getAdjacent = options.getAdjacent;
        this.getHeuristic = options.getHeuristic;
        this.getMovement = options.getMovement;
        this.evaluation = options.evaluation || 'standard';
        this.cancelPath = () => { };
    }

    // Runs callback when a path has been found.
    public async retreivePath(start: node_data, callback: (reason: callback_reason, path?: node[]) => void) {
        this.cancelPath();
        let data = await this.calculatePath(start); // asyncronously find a path
        callback(data.status, data.path);
    }

    // Find a path from point A to B
    private async calculatePath(start: node_data): Promise<path_data> {
        return new Promise<path_data>(
            (resolve) => {
                // Whether or not to keep the program running
                let interrupted = false;

                // Stops pathfinding and returns a status message with the path
                function terminate(status?: callback_reason) {
                    let reason = status || 'interrupt'; // No status specified (Manually stopped)

                    resolve({
                        status: reason,
                        path: path || [],
                    });
                }

                // List initialisation
                let open_list: string[] = [];
                let closed_list: string[] = [];
                let node_list: Record<string, node> = {};

                // Current node initialisation
                let current_node_identifier = this.getIdentifier(start);
                let current_node = new node(current_node_identifier, this.getHeuristic(start), this.getMovement(start), start); // start should be specified as a parameter; not in the plugin initialisation
                let adjacent_node_data = this.getAdjacent(start);
                this.cancelPath = () => interrupted = true;
                node_list[current_node.identifier] = current_node;

                // Keep repeating until there are no moves left or a path has been found
                do {

                    closed_list.push(current_node_identifier);
                    // remove current_node_identifier from open list
                    let adjacent_nodes = this.retreiveAdjacentNodes(current_node, adjacent_node_data);

                    // Add adjacent nodes to open list (If valid)
                    adjacent_nodes.forEach((adjacent_node: node) => {
                        node_list[adjacent_node.identifier] = adjacent_node;

                        // Node is valid (Not in closed list or open list)
                        if (!closed_list.includes(adjacent_node.identifier) && !closed_list.includes(adjacent_node.identifier)) { // for efficiency, maybe put in retreiveAdjacentNodes
                            open_list.push(adjacent_node.identifier);
                        }
                    });

                    // Get the cheapest node from open list
                    let cheapest_node_identifier: string = open_list[0];
                    let new_open_list: string[] = [];

                    for (let i = 1, il = open_list.length; i < il; i++) {
                        let identifier = open_list[i];
                        let candidate_node = node_list[identifier];

                        // Avoid adding back the node that has already been checked
                        if (identifier !== current_node_identifier) {

                            // Found a shorter/cheaper route
                            if (cheapest_node_identifier && (this.evaluateNode(candidate_node) < this.evaluateNode(node_list[cheapest_node_identifier]))) {
                                new_open_list.push(cheapest_node_identifier); // add the previous smallest node back to oepn list
                                cheapest_node_identifier = identifier;
                            }

                            // Add smaller node back to open list
                            else new_open_list.push(identifier);
                        }
                    };
                    open_list = new_open_list; // update the open list.

                    // set the new current node to the cheapest node
                    current_node_identifier = cheapest_node_identifier;

                } while (!interrupted && open_list.length > 0 && !this.isDestination(current_node));

                // Generate a path by backtracking the final node
                let closest_node: node;
                let path: node[];
                let status: callback_reason; // not used for interrupt

                // A path was successfully found
                if (this.isDestination(current_node)) {
                    closest_node = current_node;
                    path = this.retreiveFinalNodePath(closest_node, node_list);
                    status = 'success';
                }

                // No path; Either partially or completely.
                else {
                    closest_node = this.retreiveClosestNode(node_list);
                    path = this.retreiveFinalNodePath(closest_node, node_list);
                    status = interrupted ? 'interrupt' : path.length < 1 ? 'failure' : 'incomplete';
                }

                // success if a path was generated
                terminate(status);
            });
    }

    // Converts adjacent node data into nodes and sets its parent
    private retreiveAdjacentNodes(current_node: node, adjacent_node_data: node_data[]): node[] {
        let adjacent_nodes = [];

        for (let data of adjacent_node_data) {
            let adjacent_node = new node(this.getIdentifier(data), this.getHeuristic(data), this.getMovement(data) + current_node.cost, data);
            adjacent_node.setParent(current_node.identifier);
            adjacent_nodes.push(adjacent_node);
        }

        return adjacent_nodes;
    }

    // Return the path backtracked from the final node
    private retreiveFinalNodePath(final_node: node, node_list: Record<string, node>): node[] {
        let path: node[] = [];
        let current_node = final_node;

        // Final node has a parent node (Start != Finish)
        if (final_node.parent) {

            // Repeat while current node still has a parent node
            while (current_node.parent) {
                let identifier = current_node.parent;
                current_node = node_list[identifier];
                path.push(current_node);
            };
        }

        return path;
    }

    // Returns the sum of the heuristic and movement cost taking evaluation type into consideration
    private evaluateNode(current_node: node): number {
        let heuristic = current_node.heuristic;
        let cost = this.evaluation === 'greedy' ? 0 : current_node.cost; // ignore the cost for 'greedy' evaluation
        return heuristic + cost;
    }

    // Returns the closest node to the objective, called when interrupted or a path couldn't be found
    private retreiveClosestNode(node_list: Record<string, node>): node {
        let keys = Object.keys(node_list);
        let closest_node: string = keys[0]; // node_list will never be empty so we can do this

        // check every registered node
        for (let i = 1, il = keys.length; i < il; i++) {
            let candidate_identifier = keys[i];
            let candidate_node = node_list[candidate_identifier];

            // Found a closer node
            if (candidate_node.heuristic < node_list[closest_node].heuristic) {
                closest_node = candidate_identifier;
            }
        }
        return node_list[closest_node];
    };
}