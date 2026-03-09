"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateAutomaton = translateAutomaton;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
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
            simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Ceci n'est pas, ou ne contient pas, de texte automaton"), true);
            return;
        }
        const groups = content.split("   ");
        const result = groups.map(group => group.trim().split(/\s+/).filter(x => x));
        const words = result.map(group => group.map(emoji => {
            if (simplediscordbot_1.DiscordRegex.DISCORD_MENTION_REGEX.test(emoji)) {
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
        const elbed = simplediscordbot_1.EmbedManager.create();
        elbed.setTitle("Traduction");
        elbed.setDescription(translatedContent);
        simplediscordbot_1.Bot.interaction.send(interaction, elbed, true);
    }
    catch (e) {
        console.error(e);
        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e}`));
    }
}
