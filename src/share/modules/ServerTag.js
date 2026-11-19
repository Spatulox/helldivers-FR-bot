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
exports.ServerTag = void 0;
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const MessageManager_1 = require("../managers/MessageManager");
class ServerTag extends discord_module_1.Module {
    get events() {
        return {
            [discord_js_1.Events.GuildMemberAdd]: (member) => { this.handleGuildMemberAdd(member); },
            // GuildMemberUpdate passe (ancien, nouveau) : c'est le nouvel état qui porte le tag à vérifier
            [discord_js_1.Events.GuildMemberUpdate]: (_oldMember, newMember) => { this.handleGuildMemberUpdate(newMember); },
            [discord_js_1.Events.VoiceStateUpdate]: (oldState, newState) => { this.handleVoiceJoin(oldState, newState); },
        };
    }
    constructor() {
        super();
        this.name = "ServerTag";
        this.description = "Check the server tag of a user and send an alert if it's a forbidden tag, including when they join a voice channel";
    }
    static getUserTag(member) {
        var _a;
        return (_a = member.user.primaryGuild) === null || _a === void 0 ? void 0 : _a.tag;
    }
    static getUserPrimaryGuild(member) {
        return member.user.primaryGuild;
    }
    userIsInUnauthorizedClan(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ServerTag.mutex.lock();
            try {
                if (member.guild.id != this.guildId)
                    return false;
                const userClan = member.user.primaryGuild;
                if (!userClan || !userClan.tag)
                    return false;
                if (ServerTag.UNAUTHORIZED_TAG.includes(userClan.tag)) {
                    return true;
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                ServerTag.mutex.unlock();
            }
            return false;
        });
    }
    handleGuildMemberAdd(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if ((yield this.userIsInUnauthorizedClan(member)) && !ServerTag.limiter.take(member.user.id)) {
                const embed = simplediscordbot_1.EmbedManager.simple(`<@${member.user.id}> (${member.nickname || member.user.globalName || member.user.username}) a un tag de clan interdit : ${ServerTag.getUserTag(member)}`);
                MessageManager_1.MessageManager.sendToAdminChannel(embed, this.botType);
            }
        });
    }
    handleGuildMemberUpdate(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handleGuildMemberAdd(member);
        });
    }
    /**
     * Signale un membre au tag de clan interdit qui entre dans un vocal (ou change de salon).
     *
     * L'automod Discord ne bloque pas les clients console : ces membres entrent dans les vocaux
     * malgré leur tag. Le rapport part dans #retour_bot (niveau info de la config de log) et dans
     * #alert, au plus une fois par membre et par heure.
     */
    handleVoiceJoin(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            // Mute, sourdine, stream… déclenchent aussi l'événement : seules les entrées et changements de salon comptent
            if (!newState.channelId || oldState.channelId === newState.channelId) {
                return;
            }
            const member = newState.member;
            if (!member || member.user.bot) {
                return;
            }
            try {
                // Le tag en cache peut être périmé : on recharge le profil (users.fetch met à jour le User en cache)
                yield member.user.fetch(true).catch(() => null);
                if (!(yield this.userIsInUnauthorizedClan(member))) {
                    return;
                }
                if (ServerTag.voiceLimiter.take(member.user.id)) {
                    return;
                }
                const displayName = member.nickname || member.user.globalName || member.user.username;
                const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.orange)
                    .setTitle("Tag de clan interdit en vocal")
                    .setDescription(`<@${member.user.id}> (${displayName}) est entré dans <#${newState.channelId}> avec un tag de clan interdit.\n-# L'automod Discord ne bloque pas les joueurs sur console.`);
                simplediscordbot_1.EmbedManager.fields(embed, [
                    { name: "Membre", value: `<@${member.user.id}>\n\`${member.user.id}\``, inline: true },
                    { name: "Tag", value: `\`${ServerTag.getUserTag(member)}\``, inline: true },
                    { name: "Salon", value: `<#${newState.channelId}>`, inline: true },
                ]);
                yield Promise.all([
                    simplediscordbot_1.Bot.log.info(embed),
                    MessageManager_1.MessageManager.sendToAdminChannel(embed, this.botType),
                ]);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`ServerTag (vocal) : ${error}`);
            }
        });
    }
}
exports.ServerTag = ServerTag;
ServerTag.mutex = new simplediscordbot_1.SimpleMutex();
ServerTag.limiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.day.DAY_01.toMilliseconds());
// Limiteur distinct : l'alerte de profil du jour ne doit pas masquer une entrée en vocal, ni l'inverse
ServerTag.voiceLimiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.hour.HOUR_01.toMilliseconds());
ServerTag.UNAUTHORIZED_TAG = ["DÆSH", "GAZA", "SEX", "PH", "OF", "DW"];
