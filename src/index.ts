import { BFS } from "./BFS";
import { calculation } from "./calculation";
import { movement } from "./movement";

/*
// Main plugin
*/

export namespace ugoki {
    export class plugin {
        private debug: boolean;
        //private BFS_plugin: BFS;
        private movement_plugin: movement;
        private calculation_plugin: calculation;

        constructor(debug: boolean) {
            this.debug = debug;
            //this.BFS_plugin = new BFS(); requires options
            this.movement_plugin = new movement();
            this.calculation_plugin = new calculation();
        }
    }
}