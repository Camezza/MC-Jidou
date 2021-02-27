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

    public adjacentNodes(data_A: node_data) {
        
    }

    
}