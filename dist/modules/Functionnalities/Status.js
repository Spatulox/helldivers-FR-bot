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
exports.Status = void 0;
const embeds_1 = require("../../utils/messages/embeds");
const Modules_1 = require("../../utils/other/Modules");
const messages_1 = require("../../utils/messages/messages");
const UnitTime_1 = require("../../utils/times/UnitTime");
class Status extends Modules_1.Module {
    constructor() {
        super("Status", "Update the bot's status in an embed every X times");
        this.embedMessage = null;
        this.interval = null;
        this.checkEveryXMinutes();
    }
    disable() {
        super.disable();
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            return true;
        }
        return false;
    }
    enable() {
        super.enable();
        if (!this.interval) {
            this.checkEveryXMinutes();
            return true;
        }
        return false;
    }
    createEmbed() {
        const embed = (0, embeds_1.createEmbed)();
        embed.title = "Last Check Bot Status";
        embed.description = `${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()}`;
        return embed;
    }
    editEmbed(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield ((_a = this.embedMessage) === null || _a === void 0 ? void 0 : _a.edit((0, embeds_1.returnToSendEmbed)(embed)));
        });
    }
    checkEveryXMinutes() {
        return __awaiter(this, void 0, void 0, function* () {
            this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
                try {
                    yield this.editEmbed(this.createEmbed());
                }
                catch (error) {
                    console.error(error);
                    (0, messages_1.sendMessageToInfoChannel)(`Check Status error : ${error}`);
                }
            }), UnitTime_1.Time.hour.HOUR_01.toMilliseconds());
        });
    }
}
exports.Status = Status;
