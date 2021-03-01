import { Vec3 } from 'vec3';
import * as mineflayer from 'mineflayer';
import * as minecraft_data from 'minecraft-data';
/*
// Calculation
*/

/*
// Does things such as:
// - Checking whether a location is safe to travel to
// - Fetching an array of nearby nodes
// - Dynamic path manipulation for new/updated ways of travelling
*/

interface node_data {
    position: Vec3,
    block: minecraft_data.Block,
    radius: number,
}

export class calculation {
    private bot: mineflayer.Bot;

    constructor(bot: mineflayer.Bot) {
        this.bot = bot;
    }

    public chebyshevDistance(data_A: node_data, data_B: node_data): number {
        let position_A = data_A.position;
        let position_B = data_B.position;

        // Calculate single axis difference
        let x_delta = position_B.x - position_A.x;
        let y_delta = position_B.y - position_A.y;
        let z_delta = position_B.z - position_A.z;
        let maximum = Math.abs(Math.max(...[x_delta, y_delta, z_delta]));
        return maximum;
    }

    public retreiveAdjacentNodes(data_A: node_data) {
        let jump_distance = this.retreiveJumpDistance();
        let node_list: Record<string, [number, number]> = {};

        // we can do this:
        // https://support.desmos.com/hc/en-us/articles/202529079-Unresolved-Detail-In-Plotted-Functions

        // for [x, y]: [x^(1/100), y^(1/100)]
        // this will give us square circle for cartesian coordinates
        // btw cannot square root negatives

        // Retreive a list of nodes from each radius
        for (let radius = 1; radius <= jump_distance || radius === -1; radius++) {
            this.retreiveCardinalNodes(radius).forEach((node) => {
                node_list[node.toString()] = node;
            });
        }
    }

    private retreiveCardinalNodes(radius: number): [number, number][] {
        return [
            [1 * radius, 0],
            [1 * radius, 1 * radius],
            [-1 * radius, 0],
            [-1 * radius, -1 * radius],
        ]
    }

    private retreiveJumpDistance(): number {
        let gravity = 32;
        let velocity_h = this.bot.physics.maxGroundSpeed; // ToDo: Account for sprinting, sprint jumping, etc.
        let velocity_y = 0.42 * 20; // 20 ticks per second
        let time = velocity_y / gravity;
        let maximum_jump_distance = 2 * time * velocity_h;
        let realistic_jump_distance = Math.floor(((maximum_jump_distance**2)/2) ** (1/2) + 0.6); // Maximum diagonal jump distance, taking 0.3 block edge stand limit into consideration
        return realistic_jump_distance;
    }
}