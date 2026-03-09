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
    SanctionTitle["SIGNALEMENT"] = "SIGNALEMENT";
    SanctionTitle["AVERTISSEMENT"] = "AVERTISSEMENT";
    SanctionTitle["EXCLUSION"] = "EXCLUSION";
    SanctionTitle["EXCLUSION_7D"] = "EXCLUSION (7j)";
    SanctionTitle["BANNISSEMENT"] = "BANNISSEMENT";
    SanctionTitle["AUTRE"] = "AUTRE";
    SanctionTitle["TECHNICIAN_TEST"] = "TECHNICIAN TEST";
})(SanctionTitle || (exports.SanctionTitle = SanctionTitle = {}));
function sanction(interaction) {
    new ModerateMembers_1.ModerateMembers(interaction, SanctionTitle.SANCTION);
}
