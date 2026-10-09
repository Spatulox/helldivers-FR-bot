"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTrackerHDFR = void 0;
const ActivityTracker_1 = require("../../../../share/modules/ActivityTracker");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
class ActivityTrackerHDFR extends ActivityTracker_1.ActivityTracker {
    static get instance() {
        return ActivityTrackerHDFR._instance;
    }
    constructor() {
        super();
        ActivityTrackerHDFR._instance = this;
    }
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    // Getter : les IDs sont résolus à l'appel, pour suivre le basculement dev/prod
    get ignoredChannelIds() {
        return [HDFR_1.HDFR.channel.chill_tryhard, HDFR_1.HDFR.channel.farm_debutant];
    }
}
exports.ActivityTrackerHDFR = ActivityTrackerHDFR;
/** Instance enregistrée par Statistics, lue par Status (et demain par d'autres modules) */
ActivityTrackerHDFR._instance = null;
