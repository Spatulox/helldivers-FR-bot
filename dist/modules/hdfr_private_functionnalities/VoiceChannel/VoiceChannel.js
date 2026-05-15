"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChannel = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const TmpVoiceChannel_1 = require("./TmpVoiceChannel");
const DeleteEmptyVoiceChannel_1 = require("./DeleteEmptyVoiceChannel");
const DetectMee6Crash_1 = require("./DetectMee6Crash");
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
class VoiceChannel extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "VoiceChannel";
        this.description = "Manage all modules related to voice channels";
        this.tmpVoice = new TmpVoiceChannel_1.TmpVoiceChannel();
        this.deleteChannel = new DeleteEmptyVoiceChannel_1.DeleteEmptyVoiceChannel();
        this.detectMee6Crash = new DetectMee6Crash_1.DetectMee6Crash();
        this.subModules = [
            this.tmpVoice,
            this.detectMee6Crash,
            this.deleteChannel
        ];
    }
    static get terminidChannel() {
        return [HDFR_1.HDFR.channel.T_info, HDFR_1.HDFR.channel.T_diff_1_2_3, HDFR_1.HDFR.channel.T_diff_4_5_6, HDFR_1.HDFR.channel.T_diff_7_8_9, HDFR_1.HDFR.channel.T_diff_max, HDFR_1.HDFR.channel.T_separator];
    }
    static get automatonChannel() {
        return [HDFR_1.HDFR.channel.A_info, HDFR_1.HDFR.channel.A_diff_1_2_3, HDFR_1.HDFR.channel.A_diff_4_5_6, HDFR_1.HDFR.channel.A_diff_7_8_9, HDFR_1.HDFR.channel.A_diff_max, HDFR_1.HDFR.channel.A_separator];
    }
    static get illuminateChannel() {
        return [HDFR_1.HDFR.channel.I_info, HDFR_1.HDFR.channel.I_diff_1_2_3, HDFR_1.HDFR.channel.I_diff_4_5_6, HDFR_1.HDFR.channel.I_diff_7_8_9, HDFR_1.HDFR.channel.I_diff_max, HDFR_1.HDFR.channel.I_separator];
    }
    static get otherChannel() {
        return [HDFR_1.HDFR.channel.FO_info, HDFR_1.HDFR.channel.farm_voc, HDFR_1.HDFR.channel.initiation_voc, HDFR_1.HDFR.channel.event_voc, HDFR_1.HDFR.channel.hd1, HDFR_1.HDFR.channel.FO_separator];
    }
    static get allTriggerChannels() {
        return [...this.terminidChannel, ...this.automatonChannel, ...this.illuminateChannel, ...this.otherChannel];
    }
    static get categories() {
        return [HDFR_1.HDFR.categories.terminids, HDFR_1.HDFR.categories.automaton, HDFR_1.HDFR.categories.illuminate, HDFR_1.HDFR.categories.farm_other];
    }
}
exports.VoiceChannel = VoiceChannel;
