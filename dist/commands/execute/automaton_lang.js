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
exports.automaton_lang = automaton_lang;
const discord_js_1 = require("discord.js");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const embeds_1 = require("../../utils/messages/embeds");
const config_json_1 = __importDefault(require("../../config.json"));
const channels_1 = require("../../utils/guilds/channels");
const client_1 = require("../../utils/client");
const rateLimiter_1 = require("../../utils/server/rateLimiter");
const messages_1 = require("../../utils/messages/messages");
const constantes_1 = require("../../utils/constantes");
const second = 60;
const rateLimiter = new discord_js_rate_limiter_1.RateLimiter(2, second * 1000);
const emojiMap = {
    'a': '<:A_:1358186405913694369>',
    'à': '<:A_:1358186405913694369>',
    'b': '<:B_:1358186396526972938>',
    'c': '<:C_:1358186384455635207>',
    'ç': '<:C_:1358186384455635207>',
    'd': '<:D_:1358186345935147226>',
    'e': '<:E_:1358186329221103789>',
    'é': '<:E_:1358186329221103789>',
    'è': '<:E_:1358186329221103789>',
    'ê': '<:E_:1358186329221103789>',
    'ë': '<:E_:1358186329221103789>',
    'f': '<:F_:1358186311911080026>',
    'g': '<:G_:1358186298195574855>',
    'h': '<:H_:1358186285277253753>', //DEV : <:Hh:1358186898782290134> // PROD : 1358186285277253753
    'i': '<:I_:1358186270525755616>', //DEV : <:Ii:1358186912862572654> // PROD : 1358186270525755616
    'î': '<:I_:1358186270525755616>',
    'ï': '<:I_:1358186270525755616>',
    'j': '<:J_:1358186256323842119>',
    'k': '<:K_:1358186240817627346>',
    'l': '<:L_:1358186224392868050>',
    'm': '<:M_:1358186206277402754>',
    'n': '<:N_:1358186185389772922>',
    'o': '<:O_:1358186145099546674>',
    'ö': '<:O_:1358186145099546674>',
    'ô': '<:O_:1358186145099546674>',
    'p': '<:P_:1358186123712659486>',
    'q': '<:Q_:1358186098748162048>',
    'r': '<:R_:1358186073347461460>',
    's': '<:S_:1358186052204105849>',
    't': '<:T_:1358186034956865659>',
    'u': '<:U_:1358186017605161151>',
    'ü': '<:U_:1358186017605161151>',
    'û': '<:U_:1358186017605161151>',
    'v': '<:V_:1358186003717951498>',
    'w': '<:W_:1358185988303622294>',
    'x': '<:X_:1358185952295780472>',
    'y': '<:Y_:1358185934914457740>',
    'z': '<:Z_:1358185875376181371>',
    '.': '<:dot:1358186559748178052>',
    ',': '<:comma:1358186502416236740>',
    '!': '<:exclamationmark:1358186528118935652>',
    '?': '<:questionmark:1358186625586172132>',
    '"': '<:doublequotationmark:1358186611136790559>',
    "'": '<:singlequotationmark:1358186642254331925>',
    "’": '<:singlequotationmark:1358186642254331925>',
    '0': '<:0_:1358186782260199585>',
    '1': '<:1_:1358186770424139987>',
    '2': '<:2_:1358186760533835837>',
    '3': '<:3_:1358186749934833716>',
    '4': '<:4_:1358186742196474039>',
    '5': '<:5_:1358186732100653086>',
    '6': '<:6_:1358186721510035548>',
    '7': '<:7_:1358186709086507058>',
    '8': '<:8_:1358186694859292732>',
    '9': '<:9_:1358186682792411166>',
};
function automaton_lang(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (interaction.inGuild() && (yield (0, rateLimiter_1.isUserRateLimited)(interaction, rateLimiter, second))) {
                return;
            }
            const options = interaction.options;
            const message = options.getString('message');
            yield transformTextIntoAutomaton(interaction, message);
            if (interaction.guildId == constantes_1.TARGET_GUILD_ID) {
                const embed = (0, embeds_1.createEmbed)();
                embed.title = "/automaton : Message Original";
                embed.description = `MESSAGE : ${message}\nAUTEUR : <@${interaction.user.id}>`;
                (0, embeds_1.sendEmbedToAdminChannel)(embed);
            }
        }
        catch (e) {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
            if (channel != null) {
                const embed = (0, embeds_1.createErrorEmbed)(`Erreur (automaton_lang) : ${e}`);
                yield (0, embeds_1.sendEmbed)(embed, channel);
                yield (0, embeds_1.sendInteractionEmbed)(interaction, embed, true);
            }
        }
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
                if (constantes_1.DISCORD_MENTION_REGEX.test(word) || constantes_1.URL_REGEX.test(word)) {
                    return word;
                }
                return wordToEmojis(word);
            }).join("   ");
            if (transformedText.length > 2000) {
                (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Le message (une fois transformé en emoji) est trop long"), true);
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
                yield webhook.send({
                    content: transformedText,
                });
                yield webhook.delete();
                return webhook;
            }
            else {
                yield interaction.reply(transformedText);
                return null;
            }
        }
        catch (error) {
            console.error(error);
            (0, messages_1.sendMessageToInfoChannel)(`Trasnform text in automaton : ${error}`);
            return null;
        }
    });
}
