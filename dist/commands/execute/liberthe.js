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
exports.liberthe = liberthe;
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const rateLimiter_1 = require("../../utils/server/rateLimiter");
const UnitTime_1 = require("../../utils/times/UnitTime");
const timeToWait = UnitTime_1.Time.second.SEC_20.toMilliseconds();
const rateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, timeToWait);
function liberthe(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, rateLimiter_1.isUserRateLimited)(interaction, rateLimiter, timeToWait)) {
            return;
        }
        try {
            yield interaction.reply('https://cdn.discordapp.com/attachments/1219746976325701652/1221484917750501406/helldiver-wait.gif?ex=6612bf7a&is=66004a7a&hm=f57592754567a5eec683e1c7b86f67c89ab1ded3e98969fe54f37779f58b650c&');
            setTimeout(() => {
                interaction.editReply('https://cdn.discordapp.com/attachments/1219746976325701652/1221482908267843604/liberty.gif?ex=6612bd9b&is=6600489b&hm=102ce4f01c513c03e9c09ec26688320fa1063b1a5765fe73ddecc0f27203ebda&');
            }, UnitTime_1.Time.second.SEC_05.toMilliseconds());
        }
        catch (error) {
            console.error(error);
            yield interaction.reply('Une erreur est survenue lors de l\'exécution de cette commande !');
        }
    });
}
