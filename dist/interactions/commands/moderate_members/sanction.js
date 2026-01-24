"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionTitle = exports.SIGNALEMENT_REGEX = void 0;
exports.sanction = sanction;
const ModerateMembers_1 = require("./ModerateMembers");
//export const SANCTION_TITLE = "SANCTION"
exports.SIGNALEMENT_REGEX = /^SIGNALEMENT\s+\((\d+)\/3\)\s*🚨/;
var SanctionTitle;
(function (SanctionTitle) {
    SanctionTitle["SANCTION"] = "SANCTION";
    SanctionTitle["SIGNALEMENT"] = "SIGNALEMENT (1/3) \uD83D\uDEA8";
    SanctionTitle["AVERTISSEMENT"] = "AVERTISSEMENT \u26A0\uFE0F";
    SanctionTitle["EXCLUSION"] = "EXCLUSION \uD83D\uDD07";
    SanctionTitle["EXCLUSION_7D"] = "EXCLUSION (7j) \uD83D\uDD07";
    SanctionTitle["BANNISSEMENT"] = "BANNISSEMENT \u26D4";
    SanctionTitle["AUTRE"] = "AUTRE \u2753";
    SanctionTitle["TECHNICIAN_TEST"] = "TECHNICIAN TEST";
})(SanctionTitle || (exports.SanctionTitle = SanctionTitle = {}));
function sanction(interaction) {
    new ModerateMembers_1.ModerateMembers(interaction, SanctionTitle.SANCTION);
}
