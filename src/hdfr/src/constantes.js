"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIKI_FILE_REGEX = exports.WIKI_FOLDER_REGEX = exports.regexSEIC = exports.regexRole = exports.UNBAN_TAG = exports.STAR_EMOJI = exports.PRIORITY_EMOJI = void 0;
exports.PRIORITY_EMOJI = ["🦆", "✭"];
exports.STAR_EMOJI = "☆";
exports.UNBAN_TAG = "unban"; // exception prioritaire sur tous les autres rôles [...]
exports.regexRole = new RegExp(`\\[(\\d+(?:\\+|${exports.STAR_EMOJI})?|${exports.PRIORITY_EMOJI.join("|")}|${exports.UNBAN_TAG}|\\?+|\\d-\\d)\\]`, "i"); // take : [\d\+] and [\d☆] and [🦆] and [unban] and [?] and [1-9]
exports.regexSEIC = new RegExp(`\\[SEIC\\]`);
exports.WIKI_FOLDER_REGEX = /<:([a-zA-Z0-9_]+):(\d+)>/;
exports.WIKI_FILE_REGEX = /\(([a-zA-Z0-9]+)-(\d+)\)_?|([\p{Extended_Pictographic}]+)_/u;
// Les regex Discord génériques (URL, mentions d'utilisateur, de rôle, de salon) sont dans DiscordRegex
// (@spatulox/simplediscordbot) : ne garder ici que ce qui est propre au projet.
