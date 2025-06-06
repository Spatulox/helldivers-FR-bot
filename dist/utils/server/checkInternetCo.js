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
exports.checkInternetCo = checkInternetCo;
exports.checkXTimesInternetCo = checkXTimesInternetCo;
const is_online_1 = __importDefault(require("is-online"));
const log_1 = require("../log");
const UnitTime_1 = require("../times/UnitTime");
function checkInternetCo() {
    return __awaiter(this, void 0, void 0, function* () {
        let internetCo = 0;
        while (internetCo === 0) {
            const online = yield (0, is_online_1.default)();
            (0, log_1.log)('INFO : CheckingInternet');
            if (online) {
                (0, log_1.log)('INFO : Internet connection is available.');
                internetCo = 1;
                return true;
            }
            else {
                (0, log_1.log)('INFO : No internet connection, waiting 1 minute.');
                try {
                    yield new Promise((resolve) => setTimeout(resolve, UnitTime_1.Time.second.SEC_60.toMilliseconds()));
                }
                catch (_a) {
                    (0, log_1.log)('ERROR : When awaiting the promise to await 1 minutes');
                }
            }
        }
        return false;
    });
}
// ------------------------------------------------------------------------------ //
function checkXTimesInternetCo(xTime) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        while (count < xTime || count !== -1) {
            (0, log_1.log)('INFO : CheckingInternet');
            const online = yield (0, is_online_1.default)();
            if (online) {
                (0, log_1.log)('INFO : Internet connection is available.');
                count = -1;
                return true;
            }
            else {
                count++;
                (0, log_1.log)('INFO : No internet connection, waiting 1 minute.');
                try {
                    yield new Promise((resolve) => setTimeout(resolve, UnitTime_1.Time.second.SEC_60.toMilliseconds()));
                }
                catch (_a) {
                    (0, log_1.log)('ERROR : When awaiting the promise to await 1 minutes');
                }
            }
        }
        return false;
    });
}
