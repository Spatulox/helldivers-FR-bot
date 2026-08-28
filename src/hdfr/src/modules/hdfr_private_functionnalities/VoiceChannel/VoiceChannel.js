"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChannel = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const TmpVoiceChannel_1 = require("./TmpVoiceChannel");
const DeleteEmptyVoiceChannel_1 = require("./DeleteEmptyVoiceChannel");
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
//import {DetectMee6Crash} from "./DetectMee6Crash";
//import {BotType} from "../../../../../share/BotType";
//import {BotEnv} from "@spatulox/simplediscordbot";
//import {UserList} from "../../../../../share/utils/UserList";
class VoiceChannel extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "VoiceChannel";
        this.description = "Manage all modules related to voice channels";
        this.tmpVoice = new TmpVoiceChannel_1.HDFRTmpVoiceChannel();
        this.deleteChannel = new DeleteEmptyVoiceChannel_1.HDFRDeleteEmptyVoiceChannel();
        this.subModules = [
            this.tmpVoice,
            //this.detectMee6Crash,
            this.deleteChannel
        ];
    }
    //public readonly detectMee6Crash = new DetectMee6Crash(HDFR.guildID, BotEnv.dev ? UserList.shared.SPATULOX : UserList.HDFR.MEE6, BotType.HDFR);
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
