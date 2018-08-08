const internalContributors = require('./internal-contributor');
const gitHelper = require('./git-helper');
const handleAdPR = require('./ad-handler').handleAdPR;
const adIntegrationFileList = require('./ad-handler').adIntegrationFileList;

const PR_TYPE = {
  AD: 1, // Ad integration PR, ping the ad onduty person
};

function globalHandler(payload) {
  if (payload.action != 'opened') {
    return;
  }

  if (ignorePR(payload)) {
    return;
  }

  const filesPromise = gitHelper.getPullRequestFiles(payload.pull_request);

  filesPromise.then(files => {
    const type = analyzeChangedFiles(files);
    if (type == PR_TYPE.AD) {
      handleAdPR(payload);
    }
    // Add your PR type handler below
  });
}

/**
 * Determine the type of a give pull request
 * @param {?Array<!Object>} files
 */
function analyzeChangedFiles(files) {
  if (!files) {
    return null;
  }
  // Only support 3p ads integration files
  const fileCount = files.length;
  if (fileCount == 0) {
    return null;
  }
  let matchFileCount = 0;
  for (let i = 0; i < fileCount; i++) {
    const fileName = files[i].filename;
    for (let j = 0; j < adIntegrationFileList.length; j++) {
      const regex = adIntegrationFileList[j];
      if (regex.test(fileName)) {
        matchFileCount++;
        continue;
      }
    }
  }
  const percentage = matchFileCount / fileCount;
  if (percentage > 0.75 || matchFileCount >= 3) {
    // Still need to check the matchFileCount because of incorrect rebase.
    return PR_TYPE.AD;
  }
  return null;
}

/**
 *
 * @param {!Object} payload
 * @return {boolean}
 */
function ignorePR(payload) {
  const pr = payload.pull_request;

  // Check if the PR has an assignee
  const hasAssignee = pr.assignee || pr.assignees[0];
  if (hasAssignee) {
    return true;
  }

  // Check if the PR has reviewer
  const hasReivewer = pr.requested_reviewers[0];
  if (hasReivewer) {
    return true;
  }

  // Check if the PR is created by an internal contributor
  const author = pr.user.login;
  if (internalContributors.indexOf(author) > -1) {
    return true;
  }

  return false;
}


module.exports = globalHandler;
