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
exports.automaton_lang = automaton_lang;
exports.textIntoAutomaton = textIntoAutomaton;
const discord_js_1 = require("discord.js");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MessageManager_1 = require("../../../../share/managers/MessageManager");
const rateLimiter_1 = require("../../utils/rateLimiter");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const BotType_1 = require("../../../../share/BotType");
const second = 60;
const rateLimiter = new discord_js_rate_limiter_1.RateLimiter(2, second * 1000);
const emojiMap = {
    'a': '<:A_:1544972211415294032>',
    'à': '<:A_:1544972211415294032>',
    'b': '<:B_:1544972209137786953>',
    'c': '<:C_:1544972207040630827>',
    'ç': '<:C_:1544972207040630827>',
    'd': '<:D_:1544972205165781013>',
    'e': '<:E_:1544972202565443586>',
    'é': '<:E_:1544972202565443586>',
    'è': '<:E_:1544972202565443586>',
    'ê': '<:E_:1544972202565443586>',
    'ë': '<:E_:1544972202565443586>',
    'f': '<:F_:1544972200304582706>',
    'g': '<:G_:1544972198148702218>',
    'h': '<:H_:1544972196160479292>',
    'i': '<:I_:1544972194067783731>',
    'î': '<:I_:1544972194067783731>',
    'ï': '<:I_:1544972194067783731>',
    'j': '<:J_:1544972192012570704>',
    'k': '<:K_:1544972189898375220>',
    'l': '<:L_:1544972187579060266>',
    'm': '<:M_:1544972185586769980>',
    'n': '<:N_:1544972183229702144>',
    'o': '<:O_:1544972180855455755>',
    'ö': '<:O_:1544972180855455755>',
    'ô': '<:O_:1544972180855455755>',
    'p': '<:P_:1544972179068944439>',
    'q': '<:Q_:1544972176971792426>',
    'r': '<:R_:1544972175239548959>',
    's': '<:S_:1544972173238865920>',
    't': '<:T_:1544972170562895964>',
    'u': '<:U_:1544972168696303646>',
    'ü': '<:U_:1544972168696303646>',
    'û': '<:U_:1544972168696303646>',
    'v': '<:V_:1544972166666395671>',
    'w': '<:W_:1544972163969458190>',
    'x': '<:X_:1544972161985548329>',
    'y': '<:Y_:1544972159942656010>',
    'z': '<:Z_:1544972157480599573>',
    '.': '<:dot:1544972223142567950>',
    ',': '<:comma:1544972213395128392>',
    '!': '<:exclamationmark:1544972218130501666>',
    '?': '<:questionmark:1544972231073988708>',
    '"': '<:doublequotationmark:1544972228972642414>',
    "'": '<:singlequotationmark:1544972232873480205>',
    "’": '<:singlequotationmark:1544972232873480205>',
    '0': '<:0_:1544972258236432490>',
    '1': '<:1_:1544972256474570783>',
    '2': '<:2_:1544972254146727966>',
    '3': '<:3_:1544972248652451870>',
    '4': '<:4_:1544972246047658044>',
    '5': '<:5_:1544972243497656331>',
    '6': '<:6_:1544972241802891300>',
    '7': '<:7_:1544972238971740244>',
    '8': '<:8_:1544972237126238210>',
    '9': '<:9_:1544972235104850012>',
};
function automaton_lang(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (interaction.inGuild() && (yield (0, rateLimiter_1.isUserRateLimited)(interaction, rateLimiter, second))) {
                return;
            }
            const options = interaction.options;
            const message = options.getString('message');
            if (!message) {
                yield interaction.reply("You need to specify a message");
                return;
            }
            const msg = yield transformTextIntoAutomaton(interaction, message);
            if (interaction.guildId == HDFR_1.HDFR.guildID) {
                const embed = simplediscordbot_1.EmbedManager.create();
                embed.setTitle("/automaton : Message Original");
                simplediscordbot_1.EmbedManager.fields(embed, [
                    { name: "Auteur", value: `<@${interaction.user.id}>` },
                    { name: "Message", value: `${message}` }
                ]);
                if (msg && typeof msg !== 'string') {
                    simplediscordbot_1.EmbedManager.field(embed, { name: "Lien", value: `${msg.url}` });
                }
                MessageManager_1.MessageManager.sendToAdminChannel(embed, BotType_1.BotType.HDFR);
            }
        }
        catch (e) {
            const embed = simplediscordbot_1.EmbedManager.error(`Erreur (automaton_lang) : ${e}`);
            yield simplediscordbot_1.GuildManager.channel.text.message.send(HDFR_1.HDFR.channel.helldivers_bot_log, embed);
            yield simplediscordbot_1.Bot.interaction.send(interaction, embed, true);
        }
    });
}
function textIntoAutomaton(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageTMP = yield transformTextIntoAutomaton(null, message);
        if (typeof (messageTMP) !== "string") {
            return "HAHA";
        }
        return messageTMP;
    });
}
function transformTextIntoAutomaton(interaction, testToSend) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            function wordToEmojis(word) {
                return word
                    .toLowerCase()
                    .split('')
                    .map(char => emojiMap[char] || char)
                    .join(' ');
            }
            const words = testToSend.split(" ");
            const transformedText = words.map((word) => {
                if (simplediscordbot_1.DiscordRegex.DISCORD_MENTION_REGEX.test(word) || simplediscordbot_1.DiscordRegex.URL_REGEX.test(word)) {
                    return word;
                }
                return wordToEmojis(word);
            }).join("   ");
            if (!interaction) {
                return transformedText;
            }
            if (transformedText.length > 2000) {
                simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Le message (une fois transformé en emoji) est trop long"), true);
                return null;
            }
            const channel = interaction.channel;
            if (channel && channel.type === discord_js_1.ChannelType.GuildText) {
                let username = interaction.user.globalName || interaction.user.username || "Unknow";
                const member = interaction.member;
                if (member != null && member.nickname) {
                    username = member.nickname;
                }
                yield interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
                const webhook = yield channel.createWebhook({
                    name: username,
                    avatar: interaction.user.avatarURL(),
                });
                interaction.deleteReply();
                const msg = yield webhook.send({
                    content: transformedText,
                });
                yield webhook.delete();
                return msg;
            }
            else {
                yield interaction.reply(transformedText);
                return null;
            }
        }
        catch (error) {
            console.error(error);
            simplediscordbot_1.Bot.log.info(`Transform text in automaton : ${error}`);
            return null;
        }
    });
}
