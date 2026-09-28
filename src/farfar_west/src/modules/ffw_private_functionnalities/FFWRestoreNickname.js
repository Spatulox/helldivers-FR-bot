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
exports.FFWRestoreNickname = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const promises_1 = require("timers/promises");
const FFW_1 = require("../../utils/ffw_list/FFW");
const FFWMember_1 = require("./FFWMember");
const MemberManager_1 = require("../../../../share/managers/MemberManager");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
/**
 * Retraite de FFW : tout membre dont le surnom porte le tag de prime [P.xx] (ajouté par FFWMember)
 * voit son surnom supprimé, et retrouve donc son nom Discord global.
 * Une passe complète à chaque activation (donc au démarrage), puis au fil des GuildMemberUpdate.
 */
class FFWRestoreNickname extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "Restore Nickname";
        this.description = "Reset the nicknames carrying the [P.xx] prime tag to the global Discord name";
        this.running = false;
    }
    get events() {
        return {
            [discord_js_1.Events.GuildMemberUpdate]: (_oldMember, newMember) => this.handleGuildMemberUpdate(newMember),
        };
    }
    // enable() : démarrage (ModuleManager.enableAll) · toggle() : bouton du panneau ModuleUI
    enable() {
        super.enable();
        this.startRestoreAll();
    }
    toggle() {
        super.toggle();
        if (this.enabled)
            this.startRestoreAll();
    }
    startRestoreAll() {
        this.restoreAll().catch(err => simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Restauration des pseudos : ${err}`)));
    }
    handleGuildMemberUpdate(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled || member.guild.id !== FFW_1.FFW.guildID)
                return;
            yield this.restoreMember(member);
        });
    }
    restoreAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.running)
                return;
            this.running = true;
            try {
                const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(FFW_1.FFW.guildID);
                const members = yield MemberManager_1.MemberManager.fetchMembers(guild);
                const count = { reset: 0, skipped: 0, failed: 0 };
                for (const member of members.values()) {
                    if (!this.enabled)
                        break;
                    const result = yield this.restoreMember(member);
                    count[result]++;
                    // Même pause que GuildManager.user.rename entre deux renommages
                    if (result !== "skipped")
                        yield (0, promises_1.setTimeout)(1500);
                }
                if (count.reset + count.failed > 0) {
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.simple(`**Restauration des pseudos (retrait de [P.xx])**\n` +
                        `• Surnom remis au nom Discord : ${count.reset}\n` +
                        `• Échecs : ${count.failed}`));
                }
            }
            finally {
                this.running = false;
            }
        });
    }
    restoreMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (member.user.bot || GlobalMemberManager_1.GlobalMemberManager.shouldIgnoreMember(member))
                return "skipped";
            const nickname = member.nickname;
            if (!nickname || !FFWMember_1.FFW_PRIME_TAG_REGEX.test(nickname))
                return "skipped";
            try {
                // Surnom supprimé : Discord affiche de nouveau le nom global
                yield member.setNickname(null, "Retraite de FFW : retour au nom Discord");
                simplediscordbot_1.Log.info(`Reset nickname: ${nickname} → ${(_a = member.user.globalName) !== null && _a !== void 0 ? _a : member.user.username}`);
                return "reset";
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`Impossible de restaurer le pseudo de ${member.user.tag} (${nickname}) : ${err}`);
                return "failed";
            }
        });
    }
}
exports.FFWRestoreNickname = FFWRestoreNickname;
