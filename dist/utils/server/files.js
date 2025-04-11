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
exports.readJsonFile = readJsonFile;
exports.listDirectory = listDirectory;
exports.listJsonFile = listJsonFile;
exports.listFile = listFile;
const log_1 = require("../log");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
//----------------------------------------------------------------------------//
function readJsonFile(fileName) {
    try {
        const data = fs_1.default.readFileSync(fileName, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        (0, log_1.log)(`ERROR : Erreur de lecture du fichier JSON ${fileName}: ${error}`);
        return 'Error';
    }
}
function listDirectory(directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs_1.default.promises.readdir(directoryPath, { withFileTypes: true });
            const directories = files.filter(file => file.isDirectory()).map(dir => dir.name);
            return directories;
        }
        catch (error) {
            console.log(`ERROR: Impossible de lire le dossier : ${directoryPath} : ${error}`);
            return false;
        }
    });
}
//----------------------------------------------------------------------------//
function listJsonFile(directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs_1.default.promises.readdir(directoryPath);
            return files.filter(file => path_1.default.extname(file) === '.json');
        }
        catch (err) {
            (0, log_1.log)('ERROR : impossible to read the directory: ' + err);
            return false;
        }
    });
}
//----------------------------------------------------------------------------//
function listFile(directoryPath, type) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof (type) !== 'string' || typeof (directoryPath) !== 'string') {
            return 'Type and path must me string';
        }
        try {
            if (type.includes(".")) {
                type = type.split('.')[1];
            }
            const files = yield fs_1.default.promises.readdir(directoryPath);
            return files.filter(file => path_1.default.extname(file) === '.' + type);
        }
        catch (err) {
            (0, log_1.log)('ERROR : impossible to read the directory: ' + err);
            return 'Error';
        }
    });
}
