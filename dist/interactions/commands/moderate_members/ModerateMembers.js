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
const sanction_1 = require("./sanction");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
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
                    yield simplediscordbot_1.Bot.interaction.send(this.interaction, simplediscordbot_1.EmbedManager.error("Impossible de sélectionner l'utilisateur"));
                    return;
                }
                const form = simplediscordbot_1.ModalManager.create("Moderate Members", "moderate_members");
                let fields = [{ label: "Title", type: simplediscordbot_1.ModalFieldType.SHORT, required: true, value: type !== null && type !== void 0 ? type : this.type }];
                if (type === null || type === void 0 ? void 0 : type.startsWith(sanction_1.SanctionTitle.SIGNALEMENT)) {
                    fields.push({ label: "N° Signalement", type: simplediscordbot_1.ModalFieldType.NUMBER, value: "1", required: true });
                }
                fields.push({ label: "Raison", type: simplediscordbot_1.ModalFieldType.LONG, required: true, value: reason !== null && reason !== void 0 ? reason : undefined });
                fields.push({ label: "Utilisateur(s)", type: simplediscordbot_1.ModalFieldType.LONG, required: true, value: user_id !== null && user_id !== void 0 ? user_id : undefined });
                simplediscordbot_1.ModalManager.add(form, fields);
                yield this.interaction.showModal(form.toJSON());
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(simplediscordbot_1.EmbedManager.error(` ModerateMembers.openModal() : ${error}`));
            }
        });
    }
}
exports.ModerateMembers = ModerateMembers;
