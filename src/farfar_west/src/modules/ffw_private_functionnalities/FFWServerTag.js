"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWServerTag = void 0;
const BotType_1 = require("../../../../share/BotType");
const ServerTag_1 = require("../../../../share/modules/ServerTag");
const FFW_1 = require("../../utils/ffw_list/FFW");
class FFWServerTag extends ServerTag_1.ServerTag {
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    get botType() {
        return BotType_1.BotType.FARFAR_WEST;
    }
}
exports.FFWServerTag = FFWServerTag;
