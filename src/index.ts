import core from "@actions/core";
import github from "@actions/github";
import { Octokit } from "octokit";

async function run() {
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

    const placement: "prefix" | "suffix" = inputs.placement as
      | "prefix"
      | "suffix";

    const pullRequest = github.context.payload.pull_request!;

    const title: string = pullRequest.title ?? "";

    const titleText = inputs.titleText;

    const updateTitle =
      {
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
    } else {
      core.warning("No updates were made to PR title");
    }

    if (!updateTitle) {
      return;
    }

    const octokit = new Octokit({ token: inputs.token });

    const response = await octokit.rest.pulls.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pullRequest.number,
      title: newTitle,
    });

    core.info(`Response: ${response.status}`);
    if (response.status !== 200) {
      core.error("Updating the pull request has failed");
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
