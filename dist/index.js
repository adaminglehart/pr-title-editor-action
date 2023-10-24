"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const octokit_1 = require("octokit");
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = {
                token: core.getInput("repo-token", { required: true }),
                titleText: core.getInput("title-text", { required: true }),
                placement: core.getInput("placement", { required: true }).toLowerCase(),
            };
            if (inputs.placement != "prefix" && inputs.placement != "suffix") {
                core.warning("invalid placement, must be either 'prefix' or 'suffix'");
                core.setFailed("invalid placement value");
            }
            const placement = inputs.placement;
            const pullRequest = github.context.payload.pull_request;
            const title = (_a = pullRequest.title) !== null && _a !== void 0 ? _a : "";
            const titleText = inputs.titleText;
            const updateTitle = {
                prefix: !title.toLowerCase().startsWith(titleText.toLowerCase()),
                suffix: !title.toLowerCase().endsWith(titleText.toLowerCase()),
            }[inputs.placement] || false;
            core.setOutput("didUpdateTitle", updateTitle.toString());
            let newTitle = title;
            if (updateTitle) {
                newTitle = {
                    prefix: titleText.concat(title),
                    suffix: title.concat(titleText),
                }[placement];
            }
            else {
                core.warning("No updates were made to PR title");
            }
            if (!updateTitle) {
                return;
            }
            const octokit = new octokit_1.Octokit({ token: inputs.token });
            const response = yield octokit.rest.pulls.update({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                pull_number: pullRequest.number,
                title: newTitle,
            });
            core.info(`Response: ${response.status}`);
            if (response.status !== 200) {
                core.error("Updating the pull request has failed");
            }
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
run();
