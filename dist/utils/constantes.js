"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_REGEX = exports.WIKI_FILE_REGEX = exports.WIKI_FOLDER_REGEX = exports.DO_NOT_AFFECT_THIS_USERS = exports.MAX_NICKNAME_LENGTH = exports.TARGET_GUILD_ID = exports.regexSEIC = exports.regexRole = exports.STAR_EMOJI = exports.PRIORITY_EMOJI = exports.CHECK_HOURS = void 0;
const config_json_1 = __importDefault(require("../config.json"));
exports.CHECK_HOURS = 2;
exports.PRIORITY_EMOJI = ["🦆"];
exports.STAR_EMOJI = "☆";
exports.regexRole = new RegExp(`\\[(\\d+(?:\\+|${exports.STAR_EMOJI})?|${exports.PRIORITY_EMOJI.join("|")}|\\?+|\d-\d)\\]`); // take : [\d\+] and [\d☆] and [🦆] and [?] and [1-9]
exports.regexSEIC = new RegExp(`\\[SEIC\\]`);
//export const regex = /\[(\d+(?:\+|☆)?|PRIORITY_EMOJI|\?+)\]/; // take : [\d\+] and [\d☆] and [🦆] and [?]
exports.TARGET_GUILD_ID = config_json_1.default.guildId;
exports.MAX_NICKNAME_LENGTH = 32;
exports.DO_NOT_AFFECT_THIS_USERS = ["877326929869561877"];
exports.WIKI_FOLDER_REGEX = /<:([a-zA-Z0-9_]+):(\d+)>/;
exports.WIKI_FILE_REGEX = /\(([a-zA-Z0-9_]+)-(\d+)\)/;
exports.URL_REGEX = /(https?:\/\/[^s]+)/;
