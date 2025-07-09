"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateAutomaton = translateAutomaton;
const embeds_1 = require("../../utils/messages/embeds");
const constantes_1 = require("../../utils/constantes");
const emojiToChar = {
    comma: ",",
    diacritic: "´",
    exclamationmark: "!",
    Oumlaut: "ö",
    dot: ".",
    Umlaut: "ü",
    doublequotationmark: '"',
    questionmark: "?",
    singlequotationmark: "'"
};
function translateAutomaton(interaction) {
    try {
        const content = interaction.targetMessage.content;
        const list = ["comma", "diacritic", "exclamationmark", "Oumlaut", "dot", "Umlaut", "doublequotationmark", "questionmark", "singlequotationmark"];
        const regex = new RegExp(`<:([A-Z0-9]_|${list.join("|")}):\\d+>`, "g");
        const matches = content.match(regex);
        if (!matches || matches.length === 0) {
            (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Ceci n'est pas, ou ne contient pas, de texte automaton"), true);
            return;
        }
        const groups = content.split("   ");
        const result = groups.map(group => group.trim().split(/\s+/).filter(x => x));
        const words = result.map(group => group.map(emoji => {
            if (constantes_1.DISCORD_MENTION_REGEX.test(emoji)) {
                return emoji;
            }
            const matchCustom = emoji.match(/^<:(.+?)(?::|_:)\d+>$/);
            if (matchCustom) {
                const name = matchCustom[1];
                if (name && emojiToChar[name]) {
                    return emojiToChar[name];
                }
            }
            else {
                return emoji;
            }
            return emoji[2];
        }).join(""));
        const translatedContent = words.join(" ");
        const elbed = (0, embeds_1.createEmbed)();
        elbed.title = "Traduction";
        elbed.description = translatedContent;
        (0, embeds_1.sendInteractionEmbed)(interaction, elbed, true);
    }
    catch (e) {
        console.error(e);
        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${e}`));
    }
}
