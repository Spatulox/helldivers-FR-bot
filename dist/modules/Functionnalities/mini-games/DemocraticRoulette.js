"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemocraticRoulette = void 0;
const Modules_1 = require("../../../utils/other/Modules");
/**
 * This class only manager the StratagemHero module, not how the mini-games works
 */
class DemocraticRoulette extends Modules_1.Module {
    constructor() {
        if (DemocraticRoulette._instance) {
            return DemocraticRoulette._instance;
        }
        super("Democratic Roulette", "Module for the Democratic Roulette mini-game");
        DemocraticRoulette._instance = this;
    }
    static get instance() {
        return DemocraticRoulette._instance;
    }
}
exports.DemocraticRoulette = DemocraticRoulette;
DemocraticRoulette._instance = null;
DemocraticRoulette.lastRoulette = null;
