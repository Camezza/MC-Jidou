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

    private cardinal_angle: Record<number, boolean> = {
        0: true,
        90: true,
        180: true,
        270: true,
    };

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

        // filters non-cardinal nodes by only checking between min/max 
        // only affects non-cardinal nodes, however can be changed from cardinal nodes
        let diagonal_angle_range: Record<number, number[]> = {
            1: [0, 0], // min (0-45 from left), max (0-45 from right)
            2: [0, 0],
            3: [0, 0],
            4: [0, 0],
        }

        /* For now, only use radius 1
        for (let radius = 1; radius <= jump_distance; radius++) {*/
        for (let radius = 1; radius < 2; radius++) {
            let plausible = this.retreiveRadiusVec2(radius);

            // no need to check angle for radius of 1
            if (radius === 1) {
                // do normal checks

                for (let i = 0, il = plausible.length; i < il; i++) {
                    let coordinates = plausible[i];
                    let angle = this.retreiveVec2Angle(coordinates);
                    let quadrant = this.retreiveNCQuadrant(angle);
                    let relative_angle = angle - (90 * (quadrant - 1));
                    let blocked_angle = Math.atan2(this.retreiveCoordDistance(coordinates), this.cardinal_angle[angle] ? 1 : 2 ** (1 / 2)) * (180 / Math.PI); // angle covered by boundingbox of a block

                        // cardinal node
                        if (this.cardinal_angle[relative_angle]) {
                            let previous_quadrant = this.retreivePrevQuadrant(quadrant);
                            let quadrant_max = diagonal_angle_range[quadrant][1];
                            let prev_quadrant_min = diagonal_angle_range[previous_quadrant][0];

                            // valid (coordinate angle can be reached)
                            if (quadrant_max < blocked_angle && prev_quadrant_min < blocked_angle) {
                                // only update if block is solid
                                // if block is solid: do this otherwise add to valid list
                                diagonal_angle_range[quadrant][1] = blocked_angle;
                                diagonal_angle_range[previous_quadrant][0] = blocked_angle;
                            }
                        }

                        // diagonal node
                        else {
                            let MM_index = this.retreiveAngleIndex(relative_angle);
                            let MM_angle = this.retreiveQRAngle(relative_angle, MM_index); // min/max offset that is covered by a block
                            let quadrant_relative = diagonal_angle_range[quadrant][MM_index];

                            // valid (coordinate angle can be reached)
                            if (quadrant_relative < (MM_angle + blocked_angle)) {
                                // only update if block is solid
                                // if block is solid: do this otherwise add to valid list
                                diagonal_angle_range[quadrant][MM_index] = MM_angle;
                            }
                        }
                }
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

    // Retreives all points on the radius line on a quadrant
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

    // Returns the angle of the point on a square (yaw)
    private retreiveVec2Angle(coordinate: number[]) {
        let x = coordinate[0];
        let y = coordinate[1];
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    // Retreives the quadrant of a non cardinal angle.
    private retreiveNCQuadrant(angle: number): number {
        let NCangles = [270, 180, 90, 0];
        let quadrant = [4, 3, 2, 1];

        for (let i = 0, il = NCangles.length; i < il; i++) {
            if (angle > NCangles[i]) {
                return quadrant[i];
            }
        }
        throw (new Error(`Unable to determine quadrant of non-angle`));
    }

    // Assigns a minimum/maximum angle to a quadrant-relative angle
    private retreiveQRAngle(angle: number, index: 0 | 1): number {
        return index === 0 ? 90 - angle : angle;
    }

    // Retreives which half of a quadrant a relative angle is located in. (0: Left, 1: Right)
    private retreiveAngleIndex(angle: number): 0 | 1 {
        return angle > 45 ? 0 : 1;
    }

    private retreiveCoordDistance(coordinates: number[]) {
        let x = coordinates[0];
        let y = coordinates[1];
        return (x ** 2 + y ** 2) ** (1 / 2);
    }

    // Retreives the previous quadrant (?)
    private retreivePrevQuadrant(quadrant: number): number {
        return quadrant === 1 ? 4 : quadrant - 1;
    }


}