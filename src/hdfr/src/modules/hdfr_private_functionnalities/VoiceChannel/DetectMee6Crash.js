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
exports.DetectMee6Crash = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const MessageManager_1 = require("../../../../../share/managers/MessageManager");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const VoiceChannel_1 = require("./VoiceChannel");
const WatchingOfflineUser_1 = require("../../../../../share/modules/WatchingOfflineUser");
const TmpVoiceChannel_1 = require("./TmpVoiceChannel");
const VOICE_STUCK_THRESHOLD_MS = simplediscordbot_1.Time.second.SEC_05.toMilliseconds();
/**
 * L'utilisateur surveillé (Mee6 en prod) se règle depuis Discord : le module expose une page de
 * paramètres (openSettings), donc le panneau ModuleUI affiche un bouton ⚙️ sur sa page, qui ouvre un
 * menu de sélection d'utilisateur. Le choix est gardé dans le cache `mee6_watch` et appliqué sans
 * redémarrage ; tant que le cache est vide, c'est l'ID passé au constructeur qui sert.
 */
class DetectMee6Crash extends discord_module_1.ModuleWithCache {
    constructor(guildId, defaultMemberId, botType) {
        super();
        this.name = "DetectMee6Crash";
        this.description = "Check MEE6 status periodically and detect stuck members in voice channels";
        this.cacheKey = "mee6_watch";
        // Même valeur initiale que WatchingOfflineUser.onlineStatus : une cible hors ligne au démarrage
        // est donc vue comme une transition et active TmpVoiceChannel
        this.lastWatchedOnline = true;
        // channelId → timestamp d'entrée
        this.stuckWatchMap = new Map();
        this.guildId = guildId;
        this.defaultMemberId = defaultMemberId;
        this.botType = botType;
        this.watcher = new WatchingOfflineUser_1.WatchingOfflineUser(this.guildId, this.defaultMemberId, this.botType, (isWatchedUserOnline, _status) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // La surveillance tourne dès la construction : désactivé, le module ne bascule plus rien
                if (!this.enabled)
                    return;
                // Le callback tombe à chaque contrôle : seul un changement de statut fait basculer,
                // pour qu'un choix manuel dans ModuleUI tienne jusqu'au prochain départ / retour
                if (isWatchedUserOnline === this.lastWatchedOnline)
                    return;
                this.lastWatchedOnline = isWatchedUserOnline;
                const mod = (_a = discord_module_1.ModuleManager.getInstance()) === null || _a === void 0 ? void 0 : _a.getModule(new TmpVoiceChannel_1.HDFRTmpVoiceChannel().name);
                if (!mod)
                    return;
                if (!isWatchedUserOnline && !mod.enabled) {
                    yield simplediscordbot_1.Bot.log.info("Activating automatic TmpVoiceChannel");
                    mod.enable();
                }
                else if (isWatchedUserOnline && mod.enabled) {
                    yield simplediscordbot_1.Bot.log.info("Deactivating automatic TmpVoiceChannel");
                    mod.disable();
                }
            }
            catch (e) {
                console.log(e);
            }
        }));
        void this.setup();
        // Même principe qu'ImageOcrDetection : le module enregistre lui-même l'interaction de sa page
        // de paramètres. Le constructeur tourne sur ClientReady, donc Bot.client existe déjà.
        discord_module_1.InteractionsManager.createOrGetInstance(simplediscordbot_1.Bot.client)
            .registerSelectMenu(DetectMee6Crash.SELECT_ID, (interaction) => {
            void this.saveWatchedUser(interaction);
        });
    }
    initData() {
        var _a;
        // Appelé une première fois par le constructeur parent, avant que defaultMemberId soit
        // assigné : loadCache() le rappelle ensuite avec la bonne valeur
        return { memberId: (_a = this.defaultMemberId) !== null && _a !== void 0 ? _a : "" };
    }
    /** Charge la cible enregistrée et bascule la surveillance dessus si elle diffère du défaut */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadCache();
                if (this.cache.memberId && this.cache.memberId != this.defaultMemberId) {
                    this.watcher.startWatching(this.cache.memberId, this.guildId);
                }
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`DetectMee6Crash : ${error}`);
            }
        });
    }
    // ------------------------------------------------------------------ //
    //  Paramètres
    // ------------------------------------------------------------------ //
    /**
     * Page de paramètres : un menu de sélection d'utilisateur, pré-rempli avec la cible courante.
     * ModuleUI ne répond pas à l'interaction à notre place, c'est à nous de le faire.
     */
    openSettings(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const memberId = this.cache.memberId;
            const select = simplediscordbot_1.SelectMenuManager.users(DetectMee6Crash.SELECT_ID, "Utilisateur à surveiller");
            if (memberId) {
                select.setDefaultUsers(memberId);
            }
            yield interaction.reply({
                embeds: [simplediscordbot_1.EmbedManager.simple(`Utilisateur surveillé : ${memberId ? `<@${memberId}> (\`${memberId}\`)` : "(aucun)"}\n`
                        + "Quand il passe hors ligne, les salons vocaux temporaires du bot prennent le relais.")],
                components: [simplediscordbot_1.SelectMenuManager.row(select)],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        });
    }
    /** Validation du menu : enregistre la nouvelle cible et relance la surveillance dessus */
    saveWatchedUser(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const memberId = interaction.values[0];
                if (!memberId) {
                    yield interaction.update({ embeds: [simplediscordbot_1.EmbedManager.error("Aucun utilisateur sélectionné")], components: [] });
                    return;
                }
                this.cache.memberId = memberId;
                yield this.writeCache();
                this.watcher.startWatching(memberId, this.guildId);
                yield interaction.update({
                    embeds: [simplediscordbot_1.EmbedManager.success(`Utilisateur surveillé : <@${memberId}> (\`${memberId}\`)`)],
                    components: [],
                });
                simplediscordbot_1.Bot.log.info(`DetectMee6Crash : utilisateur surveillé changé pour ${memberId} par ${interaction.user.id}`);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`DetectMee6Crash : ${error}`);
            }
        });
    }
    // ------------------------------------------------------------------ //
    //  Events
    // ------------------------------------------------------------------ //
    get events() {
        return {
            [discord_js_1.Events.VoiceStateUpdate]: (oldState, newState) => {
                this.handleVoiceUpdate(oldState, newState);
            },
        };
    }
    handleVoiceUpdate(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const userId = (_b = (_a = newState.member) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = oldState.member) === null || _c === void 0 ? void 0 : _c.id;
            if (!userId)
                return;
            const leftChannelId = oldState.channelId;
            const joinedChannelId = newState.channelId;
            // --- L'utilisateur quitte un trigger channel → annule le timer stuck ---
            if (leftChannelId && this.stuckWatchMap.has(userId)) {
                const entry = this.stuckWatchMap.get(userId);
                if (entry.channelId === leftChannelId) {
                    this.stuckWatchMap.delete(userId);
                }
            }
            // --- L'utilisateur rejoint un trigger channel → démarre le timer stuck ---
            if (joinedChannelId && VoiceChannel_1.VoiceChannel.allTriggerChannels.includes(joinedChannelId)) {
                this.stuckWatchMap.set(userId, { channelId: joinedChannelId, since: Date.now() });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f;
                    const entry = this.stuckWatchMap.get(userId);
                    if (!entry || entry.channelId !== joinedChannelId)
                        return; // déjà parti
                    const member = (_a = newState.member) !== null && _a !== void 0 ? _a : oldState.member;
                    const channelName = (_c = (_b = newState.channel) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : joinedChannelId;
                    const channelId = (_e = (_d = newState.channel) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : joinedChannelId;
                    yield this.sendAlert(`🔴 **${(_f = member === null || member === void 0 ? void 0 : member.user.tag) !== null && _f !== void 0 ? _f : userId}** est bloqué dans **<#${channelId !== null && channelId !== void 0 ? channelId : channelName}>** depuis plus de ${VOICE_STUCK_THRESHOLD_MS / 1000}s.`);
                }), VOICE_STUCK_THRESHOLD_MS);
            }
        });
    }
    // ------------------------------------------------------------------ //
    //  Helpers
    // ------------------------------------------------------------------ //
    sendAlert(msgDebug) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = `[AutomaticMee6CrashDetection] : ${msgDebug}`;
            MessageManager_1.MessageManager.sendToAdminChannel(msg, this.botType);
            simplediscordbot_1.Bot.log.info(msg);
        });
    }
}
exports.DetectMee6Crash = DetectMee6Crash;
DetectMee6Crash.SELECT_ID = "detectMee6Crash:watchUser";
