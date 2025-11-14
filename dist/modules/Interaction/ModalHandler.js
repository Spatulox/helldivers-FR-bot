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
exports.ModalHandler = void 0;
const embeds_1 = require("../../utils/messages/embeds");
const moderate_members_json_1 = __importDefault(require("../../../form/moderate_members.json"));
const moderate_members_1 = require("../../interactions/modal/moderate_members");
const Modules_1 = require("../../utils/other/Modules");
class ModalHandler extends Modules_1.Module {
    constructor() {
        super("Modal Handler");
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!interaction.isModalSubmit())
                    return;
                if (!this.enabled) {
                    interaction.reply({ embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)((0, embeds_1.createErrorEmbed)("Interaction disabled"))] });
                    return;
                }
                switch (interaction.customId) {
                    case moderate_members_json_1.default.id:
                        //moderate_members(interaction)
                        moderate_members_1.ModerateMembers.moderate(interaction);
                        break;
                    default:
                        yield (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Hmmm, what are you doing here ?? (executeModalSubmit)"), true);
                        break;
                }
            }
            catch (error) {
            }
        });
    }
}
exports.ModalHandler = ModalHandler;
