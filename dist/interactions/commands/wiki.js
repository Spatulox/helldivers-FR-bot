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
exports.wikiMenu = wikiMenu;
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const wikiListSubthematics_1 = require("../selectmenu/wikiListSubthematics");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
function wikiMenu(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = yield simplediscordbot_1.FileManager.readJsonFile("./wikiContents/thematics.json");
        try {
            const description = new builders_1.EmbedBuilder()
                .setColor(16771082)
                .setTitle('WIKI')
                .setThumbnail(file.thumbnail);
            const direct = yield simplediscordbot_1.FileManager.listDirectories("./wikiContents/");
            if (!Array.isArray(direct)) {
                simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Une erreur est survenue"), true);
                return;
            }
            for (const dir in direct) {
                description.addFields({
                    name: ' ',
                    value: `\`\`\`${direct[dir]}\`\`\``,
                    inline: true
                });
            }
            const desc = file.descriptions;
            const emoji = file.emojis;
            const wikiThematic = new builders_1.StringSelectMenuBuilder()
                .setCustomId('wikiThematic')
                .setPlaceholder('Sélectionnez une thématique');
            try {
                for (const dir of direct) {
                    const label = dir;
                    const description = desc[label];
                    const emojiValue = emoji[label];
                    if (!description || !emojiValue) {
                        console.warn(`WARN : Clé manquante dans thematics.json pour "${label}"`);
                        continue;
                    }
                    const optionBuilder = new builders_1.StringSelectMenuOptionBuilder()
                        .setLabel(label)
                        .setDescription(description)
                        .setValue(`./wikiContents/${label}`);
                    // Vérifier si l'emoji est un emoji personnalisé ou Unicode
                    const res = (0, wikiListSubthematics_1.getEmojiObject)(emojiValue, label);
                    if (res && "id" in res && "name" in res) {
                        optionBuilder.setEmoji({ id: res.id, name: res.name });
                    }
                    else if (res && "name" in res) {
                        optionBuilder.setEmoji({ name: emojiValue });
                    }
                    else {
                        continue;
                    }
                    wikiThematic.addOptions(optionBuilder);
                }
            }
            catch (error) {
                console.error(`ERROR : Mauvais noms de fichiers dans thematics.json`, error);
            }
            const select = new builders_1.ActionRowBuilder()
                .addComponents(wikiThematic);
            yield interaction.reply({
                content: 'Quel sujet voulez-vous approfondir aujourd\'hui HellDiver ?',
                embeds: [description],
                components: [select],
                flags: discord_js_1.MessageFlags.Ephemeral
            });
            setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield interaction.deleteReply(); }), simplediscordbot_1.Time.second.SEC_50.toMilliseconds());
        }
        catch (error) {
            console.error('ERROR : Éxécution de la commande /wiki' + error);
            yield interaction.reply('Erreur lors de l\'exécution de cette commande. Veuillez réessayer ou contacter un développeur');
        }
    });
}
