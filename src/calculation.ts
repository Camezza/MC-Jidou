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
        let maximum_jump_distance = this.retreiveMaxJumpDistance();
        let node_list: Record<string, number> = {};

        // Retreive a list of nodes from each radius
        for (let radius = 1; radius <= maximum_jump_distance; radius++) {
            // get list of points from circle function
        }

    }

    private retreiveMaxJumpDistance(): number {
        let gravity = 32;
        let velocity_h = this.bot.physics.maxGroundSpeed; // ToDo: Account for sprinting, sprint jumping, etc.
        let velocity_y = 0.42 * 20; // 20 ticks per second
        let time = velocity_y / gravity;
        return Math.ceil(2 * time * velocity_h); // double time for ascension + descension 
    }

    private retreiveRelativePoints(radius: number, specific_angle?: number): [number, number][] {
        let square_area = (1 + (radius * 2)) ** 2;
        let previous_square_area = (1 + ((radius - 1) * 2)) ** 2;
        let checks = square_area - previous_square_area; // gets the points on the radius of the circle
        let offset = 360 / checks;
        let points: [number, number][] = [];

        // Specific angle specified
        if (specific_angle) {

            // Get adjacent points from angle (left, middle, right)
            for (let min = specific_angle - offset, max = specific_angle + offset; min <= max; min += offset) {
                points.push(this.retreiveCirclePoint(radius, min));
            }
        }

        // No angle specified; Get all points in a 360
        else {

            // Increment angle for every point (block) in the circles radius
            for (let angle = 0, max_angle = 360; angle < max_angle; angle += offset) {
                points.push(this.retreiveCirclePoint(radius, angle));
            }
        }

        return points;
    }

    // Retreives the point at a specified angle in a circle
    private retreiveCirclePoint(radius: number, angle: number): [number, number] {
        let radians: number = angle * Math.PI / 180;
        let x = parseFloat((radius * Math.sin(radians)).toFixed(1));
        let z = parseFloat((radius * Math.cos(radians)).toFixed(1));
        x = x % 1 !== 0 ? Math.sign(x) * Math.ceil(Math.abs(x)) : x; // round point up to fit cartesian plane
        z = z % 1 !== 0 ? Math.sign(z) * Math.ceil(Math.abs(z)) : z;
        return [x, z];
    }



}