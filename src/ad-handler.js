const gitHelper = require('./git-helper');
const log = require('fancy-log');
const colors = require('ansi-colors');

const AD_COMMENT = 'Dear contributor! Thank you for the pull request. ' +
    'It looks like this PR is trying to add support to an ad network. \n \n' +
    'If this is your first time adding support for ' +
    'a new third-party ad service, please make sure your follow our ' +
    '[developer guideline](https://github.com/ampproject/amphtml/blob/master/' +
    'ads/README.md#developer-guidelines-for-a-pull-request). \n \n' +
    'If you have not implemented it, we also highly recommend implementing ' +
    'the [renderStart API](https://github.com/ampproject/amphtml/blob/master/' +
    'ads/README.md#available-apis) to provide better user experience. ' +
    'Please let us know if there is any question. \n \n';

const REF_DATE = new Date('May 13, 2018 00:00:00');
const WEEK_DIFF = 604800000;

const reviewers = [
  // In rotation order
  'calebcordry',
  'zhouyx',
  'lannka',
];

const REGEX_3P_INTEGRATION = new RegExp('3p/integration.js');
const REGEX_3P_AD_JS = new RegExp('ads/[^/]+.js');
const REGEX_3P_AD_MD = new RegExp('ads/[^/]+.md');
const REGEX_3P_AD_CONFIG = new RegExp('ads/_config.js');
const REGEX_3P_AD_EXAMPLE = new RegExp('examples/ads.amp.html');
const REGEX_AD_MD = new RegExp('extensions/amp-ad/amp-ad.md');

const adIntegrationFileList = [
  REGEX_3P_INTEGRATION,
  REGEX_3P_AD_JS,
  REGEX_3P_AD_MD,
  REGEX_3P_AD_CONFIG,
  REGEX_3P_AD_EXAMPLE,
  REGEX_AD_MD,
];

function handleAdPR(payload) {
  const reviewer = calculateReviewer();
  const pr = payload.pull_request;
  const comment = AD_COMMENT + `Thank you! Ping @${reviewer} for review`;
  gitHelper.applyComment(pr, comment).then(() => {
    gitHelper.assignIssue(pr, [reviewer]);
  }).then(() => {
    log(colors.blue(`auto triaging Ad #PR${pr.number} complete`));
  });
}

/**
 * Calculate the reviewer this week, based on rotation calendar
 */
function calculateReviewer() {
  const now = Date.now();
  const diff = now - REF_DATE;
  const week = diff / WEEK_DIFF;
  const turn = Math.floor(week % 3);
  return reviewers[turn];
}

module.exports = {
   handleAdPR,
   adIntegrationFileList,
}
