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
exports.loadForm = loadForm;
const files_1 = require("../utils/server/files");
const log_js_1 = require("../utils/log.js");
const discord_js_1 = require("discord.js");
function loadForm(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let componentCount = 0;
        const MAX_COMPONENTS = 5;
        const form = yield (0, files_1.readJsonFile)(`./form/${name}.json`);
        if (form === 'Error') {
            return false;
        }
        if (!form.hasOwnProperty("title")) {
            (0, log_js_1.log)(`ERROR : Need a 'title' for the form ${name}.json`);
            return false;
        }
        if (!form.hasOwnProperty("id")) {
            (0, log_js_1.log)(`ERROR : Need a 'id' for the form ${name}.json`);
            return false;
        }
        if (!form.hasOwnProperty("inputs")) {
            (0, log_js_1.log)(`ERROR : Need a 'inputs' for the form ${name}.json`);
            return false;
        }
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(form.id)
            .setTitle(form.title);
        for (const input of form.inputs) {
            if (componentCount >= MAX_COMPONENTS) {
                (0, log_js_1.log)(`WARNING: Modal can only have ${MAX_COMPONENTS} components. Skipping remaining inputs.`);
                break;
            }
            if (!(input === null || input === void 0 ? void 0 : input.type) || !(input === null || input === void 0 ? void 0 : input.id) || !(input === null || input === void 0 ? void 0 : input.style) || !(input === null || input === void 0 ? void 0 : input.title)) {
                let okArray = ["number", "date"];
                if (!okArray.includes(input.type)) {
                    (0, log_js_1.log)(`ERROR : Need the 'type', 'id', 'style' and 'title' field for the input '${input.title}' for '${form.title}' form`);
                    break;
                }
            }
            switch (input.type) {
                case 'text':
                    const textInput = new discord_js_1.TextInputBuilder()
                        .setCustomId(input.id)
                        .setLabel(input.title)
                        .setRequired(input.required || false)
                        .setStyle(input.style === "short" ? discord_js_1.TextInputStyle.Short : discord_js_1.TextInputStyle.Paragraph);
                    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(textInput));
                    break;
                case 'text_placeholder':
                    const textInputWithPlaceholder = new discord_js_1.TextInputBuilder()
                        .setCustomId(input.id)
                        .setLabel(input.title)
                        .setRequired(input.required || false)
                        .setStyle(input.style === "short" ? discord_js_1.TextInputStyle.Short : discord_js_1.TextInputStyle.Paragraph)
                        .setPlaceholder(input.placeholder || '');
                    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(textInputWithPlaceholder));
                    break;
                case 'text_minmax_length':
                    const textInputWithLength = new discord_js_1.TextInputBuilder()
                        .setCustomId(input.id)
                        .setLabel(input.title)
                        .setRequired(input.required || false)
                        .setStyle(input.style === "short" ? discord_js_1.TextInputStyle.Short : discord_js_1.TextInputStyle.Paragraph)
                        .setMinLength(input.minLength || 0)
                        .setMaxLength(input.maxLength || 4000);
                    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(textInputWithLength));
                    break;
                case 'number':
                    const numberInput = new discord_js_1.TextInputBuilder()
                        .setCustomId(input.id)
                        .setLabel(input.title)
                        .setRequired(input.required || false)
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setPlaceholder('Entrez un nombre');
                    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(numberInput));
                    break;
                case 'date':
                    const dateInput = new discord_js_1.TextInputBuilder()
                        .setCustomId(input.id)
                        .setLabel(input.title)
                        .setRequired(input.required || false)
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setPlaceholder('JJ/MM/AAAA');
                    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(dateInput));
                    break;
                case 'date-hour':
                    const dateHourInput = new discord_js_1.TextInputBuilder()
                        .setCustomId(input.id)
                        .setLabel(input.title)
                        .setRequired(input.required || false)
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setPlaceholder('JJ/MM/AAAA hh:mm');
                    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(dateHourInput));
                    break;
            }
            componentCount++;
        }
        if (form.inputs.length > MAX_COMPONENTS) {
            (0, log_js_1.log)(`WARNING: Form '${form.title}' has ${form.inputs.length} inputs, but only ${MAX_COMPONENTS} can be displayed in a modal.`);
        }
        return modal;
    });
}
