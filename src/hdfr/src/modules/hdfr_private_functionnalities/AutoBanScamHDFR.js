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
exports.AutoBanScamHDFR = void 0;
const AutoBanScam_1 = require("../../../../share/modules/AutoBanScam");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const MiscStatistics_1 = require("../statistiques/MiscStatistics");
class AutoBanScamHDFR extends AutoBanScam_1.AutoBanScam {
    constructor() {
        super();
    }
    neRienEcrireIci(message) {
        const _super = Object.create(null, {
            neRienEcrireIci: { get: () => super.neRienEcrireIci }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (message.channelId != this.neRienEcrireIciChannel) {
                return;
            }
            yield MiscStatistics_1.MiscStatistics.incrementAutoBanScam();
            yield _super.neRienEcrireIci.call(this, message);
        });
    }
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    get alertChannel() {
        return HDFR_1.HDFR.channel.alert;
    }
    get rapportChannel() {
        return HDFR_1.HDFR.channel.rapport;
    }
    get infractionChannel() {
        return HDFR_1.HDFR.channel.infraction;
    }
    get botBrouillonChannel() {
        return HDFR_1.HDFR.channel.bot_brouillons;
    }
    get neRienEcrireIciChannel() {
        return HDFR_1.HDFR.channel.ne_rien_ecrire_ici;
    }
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isStaff(member);
    }
    isTechnician(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isTechnician(member);
    }
}
exports.AutoBanScamHDFR = AutoBanScamHDFR;
