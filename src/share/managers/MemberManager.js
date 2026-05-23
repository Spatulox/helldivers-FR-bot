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
exports.MemberManager = void 0;
const unidecode_plus_1 = __importDefault(require("unidecode-plus"));
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const constantes_1 = require("../../hdfr/src/constantes");
const promises_1 = require("timers/promises");
const HDFRUserList_1 = require("../../hdfr/src/utils/hdfr_list/HDFRUserList");
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = simplediscordbot_1.Time.minute.MIN_05.toMilliseconds();
class MemberManager {
    /**
     * @returns false when it don't apply to targetted users
     */
    static shouldIgnoreMember(member) {
        return member.id == HDFRUserList_1.HDFRUserList.GOUNIE;
    }
    static isBot(member) {
        if (member.user.bot) {
            return true;
        }
        return false;
    }
    static toggleMuteMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield member.voice.setMute(!member.voice.mute || false, `Automatic ${!member.voice.mute ? "" : "un"}mute by Helldivers [FR] Bot`);
        });
    }
    static toggleDeafMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield member.voice.setDeaf(!member.voice.mute || false, `Automatic ${!member.voice.mute ? "" : "un"}deaf by Helldivers [FR] Bot`);
        });
    }
    static isUsernamePingable(member) {
        const pingableChar = [
            [0x0030, 0x0039], // 0–9
            [0x0041, 0x005A], // A–Z IPA AZERTY LETTERS
            [0x0061, 0x007A], // a–z ipa azerty letters
            [0xFF01, 0xFF5E], // Fullwidth ASCII range
            [0x1D400, 0x1D7FF], // Large “Mathematical Alphanumeric Symbols” block
            ...MemberManager.azertyCharCodes
        ];
        /*const forbiddenRanges: [number, number][] = [
            [0x0250, 0x02AF],   // IPA Extensions
            [0x2070, 0x209F],   // Superscript and Subscript
            [0x2150, 0x218F],   // Number Forms (ⅈ, ⅱ, …)
            [0x1D00, 0x1D7F],   // Phonetic extensions
            [0x1D80, 0x1DBF],   // Phonetic extensions supplement
            [0xA700, 0xA71F],   // Modifier Tone Letters
            [0xFE50, 0xFE6F],    // Small Form Variants

            [0x0370, 0x03FF],   // Grec (Σ, etc.)
            [0x0400, 0x04FF],   // Cyrillique (Марик)
            [0x3040, 0x309F],   // Hiragana
            [0x30A0, 0x30FF],   // Katakana
            [0x4E00, 0x9FFF],   // Kanji (CJK Unified Ideographs)
            [0x0E00, 0x0E7F],   // Thaï
            [0x0600, 0x06FF],   // Arabic
            [0x0750, 0x077F],   // Arabic Supplement
            [0x08A0, 0x08FF],   // Arabic Extended-A
        ];*/
        // Ingore the [number+] & [SEIC] role
        const cleanedName = member.displayName
            .replace(constantes_1.regexRole, '')
            .replace(constantes_1.regexSEIC, '')
            .trim();
        // 1. Vérifie les caractères "pingables"
        //let nbOfOKletter = 0;
        const cleanedNameNoSpaces = cleanedName.replace(/\s+/gu, '');
        if (cleanedNameNoSpaces.length < 2) {
            MemberManager.numberOfUnpingable++;
            return false;
        }
        let consecutivePingable = 0;
        for (const char of cleanedNameNoSpaces) {
            const code = char.codePointAt(0);
            if (code !== undefined) {
                if (pingableChar.some(([start, end]) => code >= start && code <= end)) {
                    consecutivePingable++;
                    if (consecutivePingable >= 2) {
                        return true;
                    }
                }
                else {
                    consecutivePingable = 0;
                }
            }
        }
        // Werid Username transformed into regular ASCII
        const cleanCleanedName = (0, unidecode_plus_1.default)(cleanedName);
        if (cleanCleanedName && member.user.username.toLowerCase().includes(cleanCleanedName.toLowerCase())) {
            //console.log(`${member.user.username} : ${member.displayName} : ${cleanedName} : ${cleanCleanedName}`);
            return true;
        }
        // 3. Optionnel : si pas pingable mais il reste "rien" après nettoyage, renommer par username (exemple via un return spécial ou appel renommage)
        //console.log(`<@${member.id}> ${member.user.username} : le displayName ${member.displayName}, le clean name ${cleanCleanedName}`);
        MemberManager.numberOfUnpingable++;
        return false;
    }
    static getMemberStatus(member) {
        var _a, _b;
        return (_b = (_a = member.presence) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "offline";
    }
    /**
     * Récupère tous les membres d'un serveur Discord avec des tentatives en cas d'échec.
     * @param guild - Le serveur Discord cible.
     * @returns Une collection des membres du serveur.
     */
    static fetchMembers(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            simplediscordbot_1.Log.info(`Fetching Members for ${guild.name} guild`);
            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                try {
                    const members = yield guild.members.fetch();
                    simplediscordbot_1.Log.info(`Membres récupérés avec succès à la tentative ${attempt}`);
                    return members;
                }
                catch (err) {
                    console.error(`Erreur à la tentative ${attempt}: ${err}`);
                    simplediscordbot_1.Bot.log.info(`Erreur à la tentative ${attempt}: ${err}`);
                    if (attempt < MAX_ATTEMPTS) {
                        simplediscordbot_1.Log.info(`Nouvelle tentative dans 5 minutes...`);
                        try {
                            yield (0, promises_1.setTimeout)(RETRY_DELAY);
                        }
                        catch (delayErr) {
                            simplediscordbot_1.Bot.log.info(`${delayErr}`);
                        }
                    }
                    else {
                        console.error(`Échec après ${MAX_ATTEMPTS} tentatives.`);
                        throw err;
                    }
                }
            }
            throw new Error('Impossible de récupérer les membres après plusieurs tentatives.');
        });
    }
    /**
     * Vrai test qui utilise le parsing Discord de base, mais j'ai pas test, et de toute façon ca fait un vrai ping, donc non
     * @param member
     * @param channel
     * @returns
     */
    /*
    async isMemberTrulyPingable(member: GuildMember, channel: TextChannel): Promise<boolean> {
        const test = await channel.send({ content: `<@${member.id}>`, fetchReply: true });
        const pinged = test.mentions.has(member);
        await test.delete();
        return pinged;
    }
    */
    /**
     * Nettoie le pseudo actuel d'un membre en supprimant les anciens préfixes
     * et en ajoutant un nouveau préfixe.
     *
     * @param member - Le membre concerné.
     * @param prefix - Le préfixe à appliquer (nom du rôle).
     * @param forceNickname - Bypass the fallbakname by forcing the nickname to be the selected string.
     * @param regex - thing to replace with nothing
     * @returns Le nouveau pseudo formaté.
     */
    static cleanNickname(member, prefix, forceNickname, regex) {
        const fallbackName = forceNickname || member.nickname || member.user.globalName || member.user.username || '';
        const cleanName = fallbackName.replace(regex, '').trim(); // Enlève les anciens préfixes type [MOD]
        return `${prefix} ${cleanName}`;
    }
}
exports.MemberManager = MemberManager;
MemberManager.numberOfUnpingable = 0;
MemberManager.azertyChars = `
àâäéèêëïîôöùûüç
ÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ
_.-!?&()[]{}:;,/'"°²$£
@#=+*
 \\|<>%
`.replace(/\s/g, '');
MemberManager.azertyCharCodes = Array.from(new Set(MemberManager.azertyChars))
    .map(c => {
    const code = c.codePointAt(0);
    return code ? [code, code] : null;
})
    .filter((v) => v !== null);
