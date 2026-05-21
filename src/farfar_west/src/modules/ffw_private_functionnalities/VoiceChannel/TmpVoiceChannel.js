"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWTmpVoiceChannel = void 0;
const VoiceChannel_1 = require("./VoiceChannel");
const FFW_1 = require("../../../utils/ffw_list/FFW");
const TmpVoiceChannel_1 = require("../../../../../share/modules/VoiceChannel/TmpVoiceChannel");
class FFWTmpVoiceChannel extends TmpVoiceChannel_1.TmpVoiceChannel {
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    get userLimit() {
        return 4;
    }
    get allTriggerChannels() {
        return VoiceChannel_1.VoiceChannel.trainChannel;
    }
    get channelRegex() {
        return /^.+\s+train\s+#(\d+)[ABCDEF]?(?:\s.*)?$/;
    }
    formatChannelName(triggerChannel, nextChannelNumber) {
        const emote = triggerChannel.name.split(" ")[0];
        let upperLetter = "T";
        return `${emote} train #${nextChannelNumber}-${upperLetter}`;
    }
}
exports.FFWTmpVoiceChannel = FFWTmpVoiceChannel;
