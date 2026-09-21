"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscStatisticsFFW = void 0;
const MiscStatistics_1 = require("../../../../share/modules/MiscStatistics");
class MiscStatisticsFFW extends MiscStatistics_1.MiscStatistics {
}
exports.MiscStatisticsFFW = MiscStatisticsFFW;
MiscStatisticsFFW.cacheKey = "misc_stats";
MiscStatisticsFFW.cacheData = { auto_kill_count: 0 };
