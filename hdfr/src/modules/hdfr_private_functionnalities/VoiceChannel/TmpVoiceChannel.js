"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRTmpVoiceChannel = void 0;
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const VoiceChannel_1 = require("./VoiceChannel");
const TmpVoiceChannel_1 = require("../../../../../share/modules/VoiceChannel/TmpVoiceChannel");
class HDFRTmpVoiceChannel extends TmpVoiceChannel_1.TmpVoiceChannel {
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    get userLimit() {
        return 4;
    }
    get terminidChannel() {
        return VoiceChannel_1.VoiceChannel.terminidChannel;
    }
    get automatonChannel() {
        return VoiceChannel_1.VoiceChannel.automatonChannel;
    }
    get illuminateChannel() {
        return VoiceChannel_1.VoiceChannel.illuminateChannel;
    }
    get otherChannel() {
        return VoiceChannel_1.VoiceChannel.otherChannel;
    }
    get allTriggerChannels() {
        return [
            ...this.terminidChannel,
            ...this.automatonChannel,
            ...this.illuminateChannel,
            ...this.otherChannel,
        ];
    }
    get channelRegex() {
        return /^.+\s+hellpod\s+(\d+)[TAI]?(?:\s.*)?$/;
    }
    formatChannelName(triggerChannel, nextChannelNumber) {
        const emote = triggerChannel.name.split(" ")[0];
        let upperLetter;
        if (this.terminidChannel.includes(triggerChannel.id)) {
            upperLetter = "T";
        }
        else if (this.automatonChannel.includes(triggerChannel.id)) {
            upperLetter = "A";
        }
        else if (this.illuminateChannel.includes(triggerChannel.id)) {
            upperLetter = "I";
        }
        else {
            upperLetter = triggerChannel.name.slice(0, 1).toUpperCase();
        }
        return `${emote} hellpod ${nextChannelNumber}${upperLetter}`;
    }
}
exports.HDFRTmpVoiceChannel = HDFRTmpVoiceChannel;
