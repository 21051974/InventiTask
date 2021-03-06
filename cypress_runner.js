/// <reference types="Cypress" />

const rm = require('rimraf');
const cypress = require('cypress');
const yargs = require('yargs');
const marge = require('mochawesome-report-generator');
const { merge } = require('mochawesome-merge');

const argv = yargs
  .options({
    browser: {
      alias: 'b',
      describe: 'choose browser that you wanna run tests on',
      default: 'chrome',
      choices: ['chrome', 'electron', 'edge', 'firefox'],
    },
    spec: {
      alias: 's',
      describe: 'run test with specific spec file',
      default: 'cypress/tests/',
    },
    mode: {
      alias: 'm',
      describe: 'run test in headless or headed mode',
      default: 'headless',
      choices: ['headless', 'headed'],
    },
    config: {
      alias: 'config',
      describe: 'run test with different configuration',
    },
    env: {
      alias: 'e',
      describe: 'run test with specific enviromental variables',
    },
  })
  .help().argv;

rm('cypress/reports/mocha/*.', (error) => {
  if (error) {
    console.error(`Error while removing existing report files: ${error}`);
    process.exit(1);
  }
  console.log('Removing all existing report files successfully!');
});

cypress
  .run({
    browser: argv.browser,
    spec: argv.spec,
    headed: argv.mode === 'headed',
    headless: argv.mode === 'headless',
    config: argv.config,
    env: argv.env,
  })
  .then(async (testResult) => {
    console.log(process.env.BITBUCKET_BRANCH);
    const generatedReport = await Promise.resolve(
      generateReport({
        files: ['cypress/reports/mocha/*.json'],
        inline: true,
        saveJson: true,
      }),
    );
    console.log('Merged report available here:-', generatedReport);
    console.log(testResult.totalFailed);
    process.exit(testResult.totalFailed);
  })
  .catch((error) => {
    console.error('errors: ', error);
    process.exit(1);
  });

function generateReport(options) {
  return merge(options).then((report) => marge.create(report, options));
}
