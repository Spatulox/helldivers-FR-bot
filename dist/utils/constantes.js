"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCORD_MENTION_REGEX = exports.DISCORD_PING_REGEX = exports.ROLE_REGEX = exports.CHANNEL_REGEX = exports.BOT_REGEX = exports.USER_REGEX = exports.URL_REGEX = exports.WIKI_FILE_REGEX = exports.WIKI_FOLDER_REGEX = exports.DO_NOT_AFFECT_THIS_USERS = exports.MAX_NICKNAME_LENGTH = exports.TARGET_GUILD_ID = exports.SPACE = exports.regexSEIC = exports.regexRole = exports.STAR_EMOJI = exports.PRIORITY_EMOJI = exports.CHECK_HOURS = void 0;
const config_json_1 = __importDefault(require("../config.json"));
exports.CHECK_HOURS = 2;
exports.PRIORITY_EMOJI = ["🦆"];
exports.STAR_EMOJI = "☆";
exports.regexRole = new RegExp(`\\[(\\d+(?:\\+|${exports.STAR_EMOJI})?|${exports.PRIORITY_EMOJI.join("|")}|\\?+|\d-\d)\\]`); // take : [\d\+] and [\d☆] and [🦆] and [?] and [1-9]
exports.regexSEIC = new RegExp(`\\[SEIC\\]`);
exports.SPACE = "\u200B";
//export const regex = /\[(\d+(?:\+|☆)?|PRIORITY_EMOJI|\?+)\]/; // take : [\d\+] and [\d☆] and [🦆] and [?]
exports.TARGET_GUILD_ID = config_json_1.default.guildId;
exports.MAX_NICKNAME_LENGTH = 32;
exports.DO_NOT_AFFECT_THIS_USERS = ["877326929869561877"]; // Gounie
exports.WIKI_FOLDER_REGEX = /<:([a-zA-Z0-9_]+):(\d+)>/;
//export const WIKI_FILE_REGEX = /\(([a-zA-Z0-9_]+)-(\d+)\)/;
//export const WIKI_FILE_REGEX = /([\p{Emoji}\p{Extended_Pictographic}])_/u;
exports.WIKI_FILE_REGEX = /\(([a-zA-Z0-9]+)-(\d+)\)_?|([\p{Extended_Pictographic}]+)_/u;
exports.URL_REGEX = /(https?:\/\/[^s]+)/;
/* DISCORD REGEX */
exports.USER_REGEX = /<@\d{18}>/;
exports.BOT_REGEX = /<@\d{19}>/;
exports.CHANNEL_REGEX = /(<#\d{19}>)|(<id:(browse|customize|guide)>)/;
exports.ROLE_REGEX = /<@&\d{19}>/;
/**
 * Mention a User
 * Mention a Role
 */
exports.DISCORD_PING_REGEX = new RegExp(`(${exports.USER_REGEX.source})|(${exports.BOT_REGEX.source})|(${exports.ROLE_REGEX.source})`);
/**
 * Mention a User
 * Mention a Role
 * Mention a Channnel
 */
exports.DISCORD_MENTION_REGEX = new RegExp(`(${exports.DISCORD_PING_REGEX.source})|(${exports.CHANNEL_REGEX.source})`);
