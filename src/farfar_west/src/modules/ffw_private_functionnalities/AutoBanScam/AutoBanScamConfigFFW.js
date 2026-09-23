"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoBanScamConfigFFW = void 0;
const BotType_1 = require("../../../../../share/BotType");
const FFW_1 = require("../../../utils/ffw_list/FFW");
const GlobalMemberManager_1 = require("../../../../../share/managers/GlobalMemberManager");
const GWWWiki_1 = require("../../../../../share/utils/gww_list/GWWWiki");
const MiscStatisticsFFW_1 = require("../../statistics/MiscStatisticsFFW");
exports.autoBanScamConfigFFW = {
    botType: BotType_1.BotType.FARFAR_WEST,
    get guildId() {
        return FFW_1.FFW.guildID;
    },
    get alertChannel() {
        return FFW_1.FFW.channel.alert;
    },
    get rapportChannel() {
        return FFW_1.FFW.channel.rapport;
    },
    get infractionChannel() {
        return FFW_1.FFW.channel.avertissement;
    },
    get botBrouillonChannel() {
        return FFW_1.FFW.channel.bot_brouillons;
    },
    get hashHistoryChannel() {
        // Serveur GWW Wiki : même salon en dev et en prod
        return GWWWiki_1.GWWWiki.channel.historique_hash_ocr;
    },
    get neRienEcrireIciChannels() {
        return [
            FFW_1.FFW.channel.ne_rien_ecrire_ici, // principal (texte)
            //FFW.channel.ne_rien_ecrire_ici_vocal,    // chat du salon vocal
        ].filter(Boolean);
    },
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isStaff(member);
    },
    isTechnician(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isBricoleur(member);
    },
    onScamCaught() {
        return __awaiter(this, void 0, void 0, function* () {
            yield MiscStatisticsFFW_1.MiscStatisticsFFW.incrementAutoBanScam();
        });
    },
};
