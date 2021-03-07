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
    private cardinal_sign = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
    ];

    private diagonal_sign = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
    ]

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
        let valid_nodes: Record<number, number[]> = {}; 

        // filters non-cardinal nodes by only checking between min/max angles
        let diagonal_angle_range: Record<number, number[]> = {
            45: [-1, -1], // min, max
            135: [-1, -1],
            225: [-1, -1],
            315: [-1, -1],
        }
        let valid_angles: Record<number, number[]> = {};  // // (angle: true)
        
        /* For now, only use radius 1
        for (let radius = 1; radius <= jump_distance; radius++) {*/
        for (let radius = 1; radius < 2; radius++) {
            let plausible = this.retreiveRadiusVec2(radius);

            // no need to check angle for radius of 1
            if (radius === 1) {
                // do normal checks

                
            }

            else {
                // filter plausible nodes by angle
            }
        }
    }

    // PHYSICS!
    private retreiveJumpDistance(): number {
        let gravity = 32;
        let velocity_h = this.bot.physics.maxGroundSpeed; // ToDo: Account for sprinting, sprint jumping, etc.
        let velocity_y = 0.42 * 20; // 20 ticks per second
        let time = velocity_y / gravity;
        let maximum_jump_distance = 2 * time * velocity_h;
        let realistic_jump_distance = Math.floor(((maximum_jump_distance ** 2) / 2) ** (1 / 2) + 0.6); // Maximum diagonal jump distance, taking 0.3 block edge stand limit into consideration
        return realistic_jump_distance;
    }

    // Retreives all points in the corner of a square radius
    private retreiveCornerVec2(x_radius: number, y_radius: number): number[][] {
        let coordinates: number[][] = [];
        let x_sign = Math.sign(x_radius);
        let y_sign = Math.sign(y_radius);
        let x_iterations = Math.abs(x_radius);
        let y_iterations = Math.abs(y_radius);

        for (let x = 1; x <= x_iterations; x++) {
            coordinates.push([x_sign * x, y_radius]);

            if (x === x_iterations) {
                for (let y = 1; y < y_iterations; y++) {
                    coordinates.push([x_radius, y_sign * y]);
                }
            }
        }
        return coordinates;
    }

    // Retreives all points sitting on a square radius
    private retreiveRadiusVec2(radius: number) {
        let coordinates: number[][] = [];
        for (let i = 0, il = cardinal_sign.length; i < il; i++) {
            let cardinal = this.cardinal_sign[i];
            let diagonal = this.diagonal_sign[i];
            coordinates.push([cardinal[0] * radius, cardinal[1] * radius]);
            coordinates = coordinates.concat(this.retreiveCornerVec2(diagonal[0] * radius, diagonal[1] * radius));
        }
        return coordinates;
    }
}