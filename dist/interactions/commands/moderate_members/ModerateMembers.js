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
exports.ModerateMembers = void 0;
const formBuilder_1 = require("../../../builder/form/formBuilder");
const embeds_1 = require("../../../utils/messages/embeds");
class ModerateMembers {
    constructor(interaction, type) {
        this.interaction = interaction;
        this.type = type;
        this.openModal();
    }
    openModal() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const options = this.interaction.options;
                const user = options.getMember('user');
                const reason = options.getString('reason');
                const type = options.getString('type');
                let user_id;
                if (user) {
                    user_id = (_a = user.toString().split("@")[1]) === null || _a === void 0 ? void 0 : _a.split(">")[0];
                }
                else {
                    (0, embeds_1.sendInteractionEmbed)(this.interaction, (0, embeds_1.createErrorEmbed)("Impossible de sélectionner l'utilisateur"));
                    return;
                }
                const form = yield (0, formBuilder_1.loadForm)("moderate_members", { title: type || this.type, description: reason || "", user: user_id || "" });
                if (!form) {
                    console.log("No Forms :/");
                    return;
                }
                yield this.interaction.showModal(form.toJSON());
            }
            catch (error) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(` ModerateMembers.openModal() : ${error}`));
            }
        });
    }
}
exports.ModerateMembers = ModerateMembers;
