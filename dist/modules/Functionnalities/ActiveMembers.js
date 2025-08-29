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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveMember = void 0;
const Modules_1 = require("../../utils/other/Modules");
const UnitTime_1 = require("../../utils/times/UnitTime");
const messages_1 = require("../../utils/messages/messages");
const config_json_1 = __importDefault(require("../../config.json"));
const embeds_1 = require("../../utils/messages/embeds");
const channels_1 = require("../../utils/guilds/channels");
const client_1 = require("../../utils/client");
const constantes_1 = require("../../utils/constantes");
class ActiveMember extends Modules_1.Module {
    constructor() {
        super("ActiveMembers", "Module to track active members on the server.");
        this.activeMembers = new Map();
        this.cleanInterval = null;
        this.forbiddenChannelId = ["1213981643447205999", "1304584943065890846"]; // chill-tryhard / farm-debutant
        this.MIN_WINDOW = UnitTime_1.Time.minute.MIN_01.toMilliseconds();
        this.MAX_WINDOW = UnitTime_1.Time.minute.MIN_10.toMilliseconds();
        this.RESTART_COOLDOWN = UnitTime_1.Time.second.SEC_05.toMilliseconds();
        this.ACTUAL_WINDOW = this.MAX_WINDOW;
        this.lastRestart = 0;
        this.startCleaning();
        //this.show()
    }
    /*private show(){
        setTimeout(() => {
            console.log(this.activeMembers)
        }, Time.second.SEC_05.toMilliseconds())
    }*/
    // Function to adjust the interval based on the number of active members
    f(x) {
        const k = 0.1;
        return (1 + 9 * Math.exp(-k * x) * 60 * 1000);
    }
    // Calcule l'intervalle en fonction du nombre d'éléments, with a min and max
    computeInterval() {
        const base = Math.max(this.MIN_WINDOW, this.f(this.activeMembers.size));
        return Math.min(this.MAX_WINDOW, base);
    }
    /* private async startCleaning(force = false) {
        if (this.activeMembers.size === 0 && !force) {
            if (this.cleanInterval) {
                clearInterval(this.cleanInterval);
                this.cleanInterval = null;
                this.log("Aucun membre actif, arrêt du nettoyage.");
            }
            return;
        }

        const now = Date.now();
        if (!force && now - this.lastRestart < this.RESTART_COOLDOWN) return;


        // Always clean members
        await this.cleanMembers()

        const newInterval = this.computeInterval();

        // Only restart if the new TIME WINDOW is REALLY different (15s diff) from the current one
        if (this.ACTUAL_WINDOW && Math.abs(this.ACTUAL_WINDOW - newInterval) < 15000 && this.cleanInterval) {
            this.log(`No significant change in interval, not restarting. ${this.ACTUAL_WINDOW}ms | ${newInterval}ms | ${Math.abs(this.ACTUAL_WINDOW - newInterval)}`);
            return;
        }

        // Launch another one, if the new TIME WINDOW is REALLY different from the current one
        this.lastRestart = now;
        if (this.cleanInterval){
            clearInterval(this.cleanInterval);
        }

        this.ACTUAL_WINDOW = newInterval;
        this.cleanInterval = setInterval(async () => {
            this.startCleaning();
        }, this.ACTUAL_WINDOW);

        this.log(`Timer nettoyages démarré/ajusté avec un intervalle de ${this.ACTUAL_WINDOW / 1000} secondes.`);
    }

    private async cleanMembers(isRebooting: boolean = false) {
        const now = Date.now();
        const beforeCount = this.activeMembers.size;
        let removedCount = 0;

        for (const [memberId, lastMessageDate] of this.activeMembers) {
            if (now - lastMessageDate.getTime() > this.ACTUAL_WINDOW) {
                this.activeMembers.delete(memberId);
                removedCount++;
            }
        }

        const afterCount = this.activeMembers.size;

        if(isRebooting && removedCount == 0) return

        const embed = createEmbed()
        embed.title = `🧹 Nettoyage du cache actif effectué : ${Math.floor(this.ACTUAL_WINDOW/1000/60)}min`
        embed.fields = [
            { name: "Avant nettoyage", value: `${beforeCount} membres`, inline: true },
            { name: "Membres supprimés", value: `${removedCount}`, inline: true },
            { name: "Membres restants", value: `${afterCount}`, inline: true },
        ]
        embed.timestamp = new Date()
        const channel = await searchClientChannel(client, config.helldiverLogChannel)
        if(channel){
            sendEmbed(embed, channel)
        } else {
            sendMessage(`🧹 Nettoyage du cache actif effectué :\n` +
                `Avant nettoyage : ${beforeCount} membres\n` +
                `Membres supprimés : ${removedCount}\n` +
                `Membres restants : ${afterCount}`, config.errorChannel
            );
        }
        console.log(this.activeMembers)
    } */
    startCleaning() {
        return __awaiter(this, arguments, void 0, function* (force = false) {
            if (this.activeMembers.size === 0 && !force) {
                if (this.cleanInterval) {
                    clearInterval(this.cleanInterval);
                    this.cleanInterval = null;
                    this.log("Aucun membre actif, arrêt du nettoyage.");
                }
                return;
            }
            const now = Date.now();
            if (!force && now - this.lastRestart < this.RESTART_COOLDOWN)
                return;
            const newInterval = this.computeInterval();
            // Redémarrer que si la nouvelle durée diffère significativement (15s ici)
            if (this.ACTUAL_WINDOW && Math.abs(this.ACTUAL_WINDOW - newInterval) < 15000 && this.cleanInterval) {
                this.log(`No significant change in interval, not restarting. ${this.ACTUAL_WINDOW}ms | ${newInterval}ms`);
                return;
            }
            this.lastRestart = now;
            if (this.cleanInterval) {
                clearInterval(this.cleanInterval);
            }
            this.ACTUAL_WINDOW = newInterval;
            // Crée un intervalle qui déclenche cleanMembers à la fin de la durée
            this.cleanInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                const removedCount = yield this.cleanMembers();
                // On affiche un message de nettoyage seulement s’il y a eu au moins un membre supprimé
                if (removedCount > 0) {
                    this.log(`Nettoyage effectué : ${removedCount} membres supprimés.`);
                }
                // Puis on relance le timer (redémarre) avec nouveau calcul d’intervalle au cas où
                yield this.startCleaning();
            }), this.ACTUAL_WINDOW);
            this.log(`Timer nettoyages démarré/ajusté avec un intervalle de ${this.ACTUAL_WINDOW / 1000} secondes.`);
        });
    }
    cleanMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const beforeCount = this.activeMembers.size;
            let removedCount = 0;
            for (const [memberId, lastMessageDate] of this.activeMembers) {
                if (now - lastMessageDate.getTime() > this.ACTUAL_WINDOW) {
                    this.activeMembers.delete(memberId);
                    removedCount++;
                }
            }
            const afterCount = this.activeMembers.size;
            if (removedCount > 0) {
                const embed = (0, embeds_1.createEmbed)();
                embed.title = `🧹 Nettoyage du cache actif effectué : ${Math.floor(this.ACTUAL_WINDOW / 1000 / 60)} min`;
                embed.fields = [
                    { name: "Avant nettoyage", value: `${beforeCount} membres`, inline: true },
                    { name: "Membres supprimés", value: `${removedCount}`, inline: true },
                    { name: "Membres restants", value: `${afterCount}`, inline: true },
                ];
                embed.timestamp = new Date();
                const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
                if (channel) {
                    (0, embeds_1.sendEmbed)(embed, channel);
                }
                else {
                    (0, messages_1.sendMessage)(`🧹 Nettoyage du cache actif effectué :\n` +
                        `Avant nettoyage : ${beforeCount} membres\n` +
                        `Membres supprimés : ${removedCount}\n` +
                        `Membres restants : ${afterCount}`, config_json_1.default.errorChannel);
                }
            }
            return removedCount;
        });
    }
    handleMessage(message) {
        if (message.guildId != constantes_1.TARGET_GUILD_ID || this.forbiddenChannelId.includes(message.channelId))
            return;
        if (message.author.bot)
            return;
        //for (let index = 0; index < 15; index++) {
        const memberKey = message.author.id; // + index;
        // Si le membre n'était pas actif avant, on l'ajoute et on envoie un message
        const wasActive = this.activeMembers.has(memberKey);
        this.activeMembers.set(memberKey, new Date());
        if (!wasActive) {
            this.log(`Membre ${message.author.displayName} est devenu actif. ${message.url}`);
            (0, messages_1.sendMessage)(`✅ Le membre ${message.author.displayName} est maintenant actif (clé: ${memberKey}). ${message.url}`, config_json_1.default.errorChannel, false);
        }
        //}
        this.startCleaning();
    }
    getActiveMembers() {
        return new Map(this.activeMembers);
    }
    isActive(memberId) {
        return this.activeMembers.has(memberId);
    }
    activeCount() {
        return this.activeMembers.size;
    }
}
exports.ActiveMember = ActiveMember;
