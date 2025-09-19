"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SANCTION_TITLE = void 0;
exports.sanction = sanction;
const ModerateMembers_1 = require("./ModerateMembers");
exports.SANCTION_TITLE = "SANCTION";
function sanction(interaction) {
    new ModerateMembers_1.ModerateMembers(interaction, exports.SANCTION_TITLE);
}
