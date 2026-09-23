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
exports.autoBanScamConfigHDFR = void 0;
const BotType_1 = require("../../../../../share/BotType");
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const GlobalMemberManager_1 = require("../../../../../share/managers/GlobalMemberManager");
const GWWWiki_1 = require("../../../../../share/utils/gww_list/GWWWiki");
const MiscStatisticsHDFR_1 = require("../../statistiques/MiscStatisticsHDFR");
exports.autoBanScamConfigHDFR = {
    botType: BotType_1.BotType.HDFR,
    get guildId() {
        return HDFR_1.HDFR.guildID;
    },
    get alertChannel() {
        return HDFR_1.HDFR.channel.alert;
    },
    get rapportChannel() {
        return HDFR_1.HDFR.channel.rapport;
    },
    get infractionChannel() {
        return HDFR_1.HDFR.channel.infraction;
    },
    get botBrouillonChannel() {
        return HDFR_1.HDFR.channel.bot_brouillons;
    },
    get hashHistoryChannel() {
        // Serveur GWW Wiki : même salon en dev et en prod
        return GWWWiki_1.GWWWiki.channel.historique_hash_ocr;
    },
    get neRienEcrireIciChannels() {
        return [
            HDFR_1.HDFR.channel.ne_rien_ecrire_ici, // principal (texte)
            HDFR_1.HDFR.channel.ne_rien_ecrire_ici_vocal, // chat du salon vocal
        ].filter(Boolean);
    },
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isStaff(member);
    },
    isTechnician(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isTechnician(member);
    },
    onScamCaught() {
        return __awaiter(this, void 0, void 0, function* () {
            yield MiscStatisticsHDFR_1.MiscStatisticsHDFR.incrementAutoBanScam();
        });
    },
};
