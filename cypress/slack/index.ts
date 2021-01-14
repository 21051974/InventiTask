#!/usr/bin/env node

import program from "commander";
import fs from "fs";
import { slackRunner } from "./slack-alert";
let version;
try {
    const json = JSON.parse(
        fs.readFileSync(
            "./node_modules/cypress-slack-reporter/package.json",
            "utf8"
        )
    );
    version = json.version;
} catch (e) {
    try {
        const json = JSON.parse(
            fs.readFileSync(
                "./node_modules/mochawesome-slack-reporter/package.json",
                "utf8"
            )
        );
        version = json.version;
    } catch (e) {
        version = "Cannot determine version";
    }
}

program
    .option(
        `git@github.com:YOU54F/cypress-slack-reporter.git@${version}`,
        "-v, --version"
    )
    .option(
        "--vcs-provider [type]",
        "VCS Provider [github|bitbucket|none]",
        "bitbucket"
    )
    .option(
        "--ci-provider [type]",
        "CI Provider [circleci|jenkins|bitbucket|none|custom]",
        "bitbucket"
    )
    .option(
        "--custom-url [type]",
        "On selected --ci-provider=custom this link will be set to Test Report",
        `https://${process.env.BUCKET_NAME}.s3.eu-west-2.amazonaws.com/`
    )
    .option(
        "--report-dir [type]",
        "mochawesome json & html test report directory, relative to your package.json",
        "mochawesome-report"
    )
    .option(
        "--screenshot-dir [type]",
        "cypress screenshot directory, relative to your package.json",
        "mochareports/assets/screenshots"
    )
    .option(
        "--video-dir [type]",
        "cypress video directory, relative to your package.json",
        "cypress/videos"
    )
    .option("--verbose", "show log output")
    .option("--only-failed", "only send message for failed tests")
    .option(
        "--custom-text [type]",
        "popsiek",
        ""
    )
    .option(
        "--object-version-id [type]",
        "versionId",
        process.env.BUCKET_OBJECT_VERSION
    )
    // .option("--s3", "upload artefacts to s3")
    .parse(process.argv);

const ciProvider: string = program.ciProvider;
const vcsProvider: string = program.vcsProvider;
const reportDir: string = program.reportDir;
const videoDir: string = program.videoDir;
const customUrl: string = program.customUrl;
const screenshotDir: string = program.screenshotDir;
const onlyFailed: boolean = program.onlyFailed;
const customText: string = program.customText;
const objectVersionId: string = program.objectVersionId;
// const verbose: boolean = program.verbose;

if (program.verbose) {
    // tslint:disable-next-line: no-console
    console.log(
        " ciProvider:- " + ciProvider + "\n",
        "customUrl:- " + customUrl + "\n",
        "vcsProvider:- " + vcsProvider + "\n",
        "reportDirectory:- " + reportDir + "\n",
        "videoDirectory:- " + videoDir + "\n",
        "screenshotDirectory:- " + screenshotDir + "\n"
    );
}

slackRunner({
    ciProvider,
    vcsRoot: vcsProvider,
    reportDir,
    videoDir,
    screenshotDir,
    customUrl,
    onlyFailed,
    customText,
    objectVersionId
});