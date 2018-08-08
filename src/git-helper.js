const extend = require('util')._extend;
const BBPromise = require('bluebird');
const request = BBPromise.promisify(require('request'));
const argv = require('minimist')(process.argv.slice(2));


const isDryrun = argv.dryrun;
const {GITHUB_ACCESS_TOKEN} = process.env;


const defaultOption = {
  headers: {
    'User-Agent': 'amp-pr-triage-task',
    'Accept': 'application/vnd.github.v3+json',
  },
  qs: {
    'access_token': GITHUB_ACCESS_TOKEN,
  },
};

/**
 * API call to comment on a give issue.
 * @param {!Object} issue
 * @param {string} comment
 */
function applyComment(issue, comment) {
  const {number} = issue;
  const options = extend({
    url: 'https://api.github.com/repos/ampproject/amphtml/issues/'
        + `${number}/comments`,
    method: 'POST',
    body: JSON.stringify({
      'body': comment,
    }),
  }, defaultOption);
  if (isDryrun) {
    log(colors.blue(`apply comment to PR #${number}, ` +
        `comment is ${comment}`));
    return Promise.resolve();
  }
  return request(options);
}

/**
 * API call to assign an issue with a list of assignees
 * @param {!Object} issue
 * @param {!Array<string>} assignees
 */
function assignIssue(issue, assignees) {
  const {number} = issue;
  const options = extend({
    url: 'https://api.github.com/repos/ampproject/amphtml/issues/'
        + `${number}/assignees`,
    method: 'POST',
    body: JSON.stringify({
      'assignees': assignees,
    }),
  }, defaultOption);
  if (isDryrun) {
    log(colors.blue(`assign PR #${number}, ` +
        `to ${assignees}`));
    return Promise.resolve();
  }
  return request(options);
}

/**
 * API call to get all changed files of a pull request.
 * @param {!Object} pr
 */
function getPullRequestFiles(pr) {
  const options = extend({}, defaultOption);
  const {number} = pr;
  options.url = 'https://api.github.com/repos/ampproject/amphtml/pulls/'
      + `${number}/files`;
  return request(options).then(res => {
    const files = JSON.parse(res.body);
    if (!Array.isArray(files)) {
      return null;
    }
    return files;
  });
}

module.exports = {
  applyComment,
  assignIssue,
  getPullRequestFiles,
}
