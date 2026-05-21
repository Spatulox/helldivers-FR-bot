"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWDeleteEmptyVoiceChannel = void 0;
const DeleteEmptyVoiceChannel_1 = require("../../../../../share/modules/VoiceChannel/DeleteEmptyVoiceChannel");
const FFW_1 = require("../../../utils/ffw_list/FFW");
class FFWDeleteEmptyVoiceChannel extends DeleteEmptyVoiceChannel_1.DeleteEmptyVoiceChannel {
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    get categories() {
        return [FFW_1.FFW.categories.en_chasse];
    }
    get allTriggerChannel() {
        return [FFW_1.FFW.channel.prime_facile, FFW_1.FFW.channel.prime_normal, FFW_1.FFW.channel.prime_hard, FFW_1.FFW.channel.prime_tres_hard, FFW_1.FFW.channel.prime_cauchemar, FFW_1.FFW.channel.farm_et_defis, FFW_1.FFW.channel.separator];
    }
}
exports.FFWDeleteEmptyVoiceChannel = FFWDeleteEmptyVoiceChannel;
