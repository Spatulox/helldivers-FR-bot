"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRDeleteEmptyVoiceChannel = void 0;
const DeleteEmptyVoiceChannel_1 = require("../../../../../share/modules/VoiceChannel/DeleteEmptyVoiceChannel");
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const VoiceChannel_1 = require("./VoiceChannel");
class HDFRDeleteEmptyVoiceChannel extends DeleteEmptyVoiceChannel_1.DeleteEmptyVoiceChannel {
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    get categories() {
        return VoiceChannel_1.VoiceChannel.categories;
    }
    get allTriggerChannel() {
        return VoiceChannel_1.VoiceChannel.allTriggerChannels;
    }
}
exports.HDFRDeleteEmptyVoiceChannel = HDFRDeleteEmptyVoiceChannel;
