"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRServerTag = void 0;
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const BotType_1 = require("../../../../share/BotType");
const ServerTag_1 = require("../../../../share/modules/ServerTag");
class HDFRServerTag extends ServerTag_1.ServerTag {
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    get botType() {
        return BotType_1.BotType.HDFR;
    }
}
exports.HDFRServerTag = HDFRServerTag;
