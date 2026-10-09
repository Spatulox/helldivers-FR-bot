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
exports.NewHDFRMember = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const constantes_1 = require("../../constantes");
const HDFRServerTag_1 = require("./HDFRServerTag");
const HDFRRoles_1 = require("../../utils/hdfr_list/HDFRRoles");
const HDFRRoleManager_1 = require("../../utils/Manager/HDFRRoleManager");
const BotGuildMember_1 = require("../../../../share/modules/BotGuildMember");
class NewHDFRMember extends BotGuildMember_1.BotGuildMember {
    constructor() {
        super(...arguments);
        this.guildID = HDFR_1.HDFR.guildID;
    }
    get roleRegex() {
        return constantes_1.regexRole;
    }
    get unauthorizedClanTag() {
        return (member) => __awaiter(this, void 0, void 0, function* () { return yield new HDFRServerTag_1.HDFRServerTag().userIsInUnauthorizedClan(member); });
    }
    get defaultRoleIfNoMatchingRole() {
        return null;
    }
    get alertChannel() {
        return HDFR_1.HDFR.channel.alert;
    }
    findPriorityRole(roles) {
        return HDFRRoleManager_1.HDFRRoleManager.findPriorityRole(roles);
    }
    static isVerifiedMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (member.roles.cache.has(HDFRRoles_1.HDFRRoles.verifie) && member.roles.cache.has(HDFRRoles_1.HDFRRoles.non_verifie)) {
                    simplediscordbot_1.Log.info("Removing Role Non Vérifié for " + member.user.tag);
                    yield member.roles.remove(HDFRRoles_1.HDFRRoles.non_verifie);
                }
            }
            catch (err) {
                console.error(`Erreur lors de la vérification du membre ${member.user.tag} :`, err);
            }
        });
    }
    checkAndUpdateMember(member) {
        const _super = Object.create(null, {
            checkAndUpdateMember: { get: () => super.checkAndUpdateMember }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield NewHDFRMember.isVerifiedMember(member);
            return _super.checkAndUpdateMember.call(this, member);
        });
    }
}
exports.NewHDFRMember = NewHDFRMember;
