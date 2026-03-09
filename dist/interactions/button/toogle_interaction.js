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
exports.toogle_interaction = toogle_interaction;
const ManageModules_1 = require("../../modules/ManageModules");
const Modules_1 = require("../../modules/Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MemberManager_1 = require("../../utils/Manager/MemberManager");
const HDFR_1 = require("../../utils/HDFR");
function toogle_interaction(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const member = yield simplediscordbot_1.GuildManager.user.findInGuild(HDFR_1.HDFRChannelID.guildID, interaction.user.id);
            if (member && (!MemberManager_1.MemberManager.isAdmin(member) && !MemberManager_1.MemberManager.isTechnician(member) && !MemberManager_1.MemberManager.shouldIgnoreMember(member))) {
                const rep = simplediscordbot_1.EmbedManager.toInteraction(simplediscordbot_1.EmbedManager.simple("You don't have the permissions to do that"), true);
                return interaction.reply(rep);
            }
            let fullname = interaction.customId.slice(7); // remove the "toglge_"
            let name = fullname;
            let submoduleName = undefined;
            const manage = ManageModules_1.ManageModule.instance;
            let mod;
            if (fullname.includes("<_>")) { // => submodule
                name = (_a = fullname.split("<_>")[0]) !== null && _a !== void 0 ? _a : fullname;
                submoduleName = fullname.split("<_>")[1];
            }
            mod = manage.getModule(name);
            if (mod instanceof Modules_1.MultiModule) {
                if (submoduleName && submoduleName == "all") {
                    mod.enabled ? mod.disable() : mod.enable();
                    mod.editMessage(interaction);
                    yield manage.syncManageModuleMessage();
                    return;
                }
                if (submoduleName) {
                    const subModule = mod.subModuleList.find(mod => mod.name == submoduleName);
                    (subModule === null || subModule === void 0 ? void 0 : subModule.enabled) ? subModule.disable() : subModule === null || subModule === void 0 ? void 0 : subModule.enable();
                    mod.editMessage(interaction);
                    yield manage.syncManageModuleMessage();
                    return;
                }
                if (mod.enabled) {
                    manage.disableModule(name, interaction);
                    return;
                }
                manage.enableModule(name, interaction);
            }
            if (mod instanceof Modules_1.Module) {
                try {
                    if (mod.enabled) {
                        yield manage.disableModule(name);
                    }
                    else {
                        yield manage.enableModule(name);
                    }
                    yield interaction.deferUpdate();
                }
                catch (error) { }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
