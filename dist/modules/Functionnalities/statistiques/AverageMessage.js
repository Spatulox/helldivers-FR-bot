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
exports.AverageMessage = void 0;
const Modules_1 = require("../../../utils/other/Modules");
const UnitTime_1 = require("../../../utils/times/UnitTime");
const constantes_1 = require("../../../utils/constantes");
//import { client } from "../../../utils/client";
const HDFR_1 = require("../../../utils/other/HDFR");
const Status_1 = require("../Status");
class AverageMessage extends Modules_1.Module {
    constructor() {
        if (AverageMessage._instance) {
            return AverageMessage._instance;
        }
        super("Average Message", "Module to detect an average number of message for one hour, based on the current message inputs");
        this.forbiddenChannelId = ["1213981643447205999", "1304584943065890846"]; // chill-tryhard / farm-debutant
        this.windowsForExtrapolation = [
            UnitTime_1.Time.minute.MIN_05.toMilliseconds(),
            UnitTime_1.Time.minute.MIN_10.toMilliseconds(),
            UnitTime_1.Time.minute.MIN_15.toMilliseconds(),
            UnitTime_1.Time.minute.MIN_20.toMilliseconds(),
            UnitTime_1.Time.minute.MIN_30.toMilliseconds(),
            UnitTime_1.Time.minute.MIN_45.toMilliseconds(),
            UnitTime_1.Time.minute.MIN_60.toMilliseconds()
        ];
        AverageMessage._instance = this;
        //AverageMessage.startHistoricReport(client, "1215348304083161138")
    }
    static get instance() {
        return AverageMessage._instance;
    }
    /**
     * Get the current DATE with some added minute (debug feature)
     * @param addedMinutes
     * @returns
     */
    static GETDATE() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + AverageMessage.addedMinutes);
        return now.getTime();
    }
    /**
     * Calcule et stocke toutes les fenêtres historiques successives d'1h,
     * en parcourant les timestamps dans l'ordre.
    */
    static computeHistoricWindows() {
        if (AverageMessage.messagesTimestamps.length === 0) {
            AverageMessage.historicWindows = [];
            return;
        }
        const oneHour = UnitTime_1.Time.minute.MIN_60.toMilliseconds();
        const threeHours = UnitTime_1.Time.minute.MIN_60.toMilliseconds() * 3;
        const sortedTimestamps = [...AverageMessage.messagesTimestamps].sort((a, b) => a - b);
        // Filtrer sur les trois dernières heures
        const now = AverageMessage.GETDATE();
        const relevantTimestamps = sortedTimestamps.filter(ts => ts >= now - threeHours && ts <= now);
        const windows = [];
        let startIndex = 0;
        while (startIndex < relevantTimestamps.length) {
            const windowStart = relevantTimestamps[startIndex];
            const now = AverageMessage.GETDATE();
            const windowEnd = (windowStart + oneHour) > now ? now : (windowStart + oneHour);
            // Nombre de messages dans cette fenêtre [windowStart, windowEnd]
            const realCount = AverageMessage.realnumberMessageLastHour(windowStart, windowEnd);
            const extrapolated = AverageMessage.averageMessagePerHour(windowStart, windowEnd);
            windows.push({
                windowStart,
                windowEnd,
                realMessageCount: realCount,
                extrapolatedMessagesPerHour: extrapolated
            });
            // Avancer au premier message APRÈS cette fenêtre
            startIndex = relevantTimestamps.findIndex(ts => ts > windowEnd);
            if (startIndex === -1)
                break;
        }
        AverageMessage.historicWindows = windows;
    }
    /**
     * Démarre l'envoi périodique toutes les 20 secondes dans le channel donné par ID,
     * en envoyant toutes les fenêtres historiques calculées.
     */
    static startHistoricReport(client, channelId) {
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
        // Fonction d'envoi
        const sendReport = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield client.channels.fetch(channelId);
                if (!channel || !channel.isTextBased()) {
                    console.error(`Channel ${channelId} introuvable ou non textuel.`);
                    return;
                }
                const textChannel = channel;
                this.computeHistoricWindows();
                if (this.historicWindows.length === 0) {
                    yield textChannel.send("Aucun message enregistré pour générer un historique.");
                    return;
                }
                let messageContent = "**Historique messages sur fenêtres d’1 heure successives :**\n";
                for (const window of this.historicWindows) {
                    messageContent += `\n${new Date(window.windowStart).toISOString()} - ${new Date(window.windowEnd).toISOString()} : ` +
                        `${window.realMessageCount} messages réels, extrapolé à ${window.extrapolatedMessagesPerHour.toFixed(2)} msg/h`;
                }
                //console.log(AverageMessage.historicWindows)
                yield textChannel.send(messageContent);
            }
            catch (error) {
                console.error("Erreur lors de l'envoi du rapport historique :", error);
            }
        });
        sendReport();
        this.reportInterval = setInterval(sendReport, 20 * 1000);
    }
    static get HISTORIC_REPORT_MESSAGE() {
        this.computeHistoricWindows();
        let messageContent = "**Historique messages sur fenêtres d’1 heure successives :**\n";
        for (const window of this.historicWindows) {
            const start = new Status_1.Status().discordTimestamp(new Date(window.windowStart));
            const end = new Status_1.Status().discordTimestamp(new Date(window.windowEnd));
            messageContent += `\n${start} - ${end}: ` +
                `${window.realMessageCount} messages réels, extrapolé à ${window.extrapolatedMessagesPerHour.toFixed(2)} msg/h`;
        }
        return messageContent;
    }
    /**
     * Calcul the average message per hour, based on different windows (this.windowsForExtrapolation), with a différent weight between each window
     * Weight is proportinnal to the number of minute in the window
     * @param windowStart
     * @param windowEnd
     * @returns
     */
    static averageMessagePerHour(windowStart, windowEnd) {
        if (AverageMessage.messagesTimestamps.length === 0)
            return 0;
        const now = windowEnd !== null && windowEnd !== void 0 ? windowEnd : AverageMessage.GETDATE();
        const start = windowStart !== null && windowStart !== void 0 ? windowStart : (now - UnitTime_1.Time.minute.MIN_60.toMilliseconds());
        const weighted = this._instance.windowsForExtrapolation.map(windowDuration => {
            const countInWindow = AverageMessage.messagesTimestamps.filter(ts => ts >= start && ts <= now && now - ts <= windowDuration).length;
            if (countInWindow === 0)
                return { avg: 0, weight: 0 };
            return {
                avg: countInWindow * (60 * 60 * 1000) / windowDuration,
                weight: windowDuration
            };
        }).filter(o => o.weight > 0);
        if (weighted.length === 0)
            return 0;
        const sumWeight = weighted.reduce((a, o) => a + o.weight, 0);
        const weightedAvg = weighted.reduce((a, o) => a + o.avg * (o.weight / sumWeight), 0);
        return weightedAvg;
    }
    /**
     * Return the real number of message during a window
     * @param windowStart
     * @param windowEnd
     * @returns
     */
    static realnumberMessageLastHour(windowStart, windowEnd) {
        const now = windowEnd !== null && windowEnd !== void 0 ? windowEnd : AverageMessage.GETDATE();
        const start = windowStart !== null && windowStart !== void 0 ? windowStart : (now - UnitTime_1.Time.minute.MIN_60.toMilliseconds());
        return AverageMessage.messagesTimestamps.filter(ts => ts >= start && ts <= now).length;
    }
    handleMessage(message) {
        if (message.author.bot)
            return;
        if (this.forbiddenChannelId.includes(message.channelId)) {
            return;
        }
        if (message.guildId != constantes_1.TARGET_GUILD_ID) {
            return;
        }
        const match = message.content.match(/^\+(\d{1,2})$/);
        if (match && match.length > 1 && message.channelId == HDFR_1.HDFRDEBUGChannelID.general) { // debug general channel
            const value = parseInt(match[1], 10);
            if (value >= 1 && value <= 59) {
                AverageMessage.addedMinutes += value;
                console.log(`Ajout de ${value} minutes à la date de test`);
                return;
            }
        }
        this.averageMessage();
    }
    averageMessage() {
        const now = AverageMessage.GETDATE();
        AverageMessage.messagesTimestamps.push(now);
        AverageMessage.messagesTimestamps = AverageMessage.messagesTimestamps.filter(ts => now - ts <= UnitTime_1.Time.hour.HOUR_03.toMilliseconds());
        console.log(`Nombre réel messages dernière heure : ${AverageMessage.realnumberMessageLastHour()}`);
        console.log(`Moyenne extrapolée (prochaine heure) messages/heure : ${AverageMessage.averageMessagePerHour()}`);
    }
}
exports.AverageMessage = AverageMessage;
AverageMessage._instance = null;
AverageMessage.messagesTimestamps = [];
AverageMessage.addedMinutes = 0;
AverageMessage.reportInterval = null;
AverageMessage.historicWindows = [];
