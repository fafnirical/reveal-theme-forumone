#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const url = require('url');

const GitHubApi = require('github');
const glob = require('glob');
const log = require('npmlog');
const parseSlug = require('parse-github-repo-url');

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const env = process.env;

const config = Object.assign({},
  {
    assetFolder: 'dist',
    debug: !env.CI,
    githubToken: env.GH_TOKEN || env.GITHUB_TOKEN,
    githubUrl: env.GH_URL,
  },
  pkg.release
);

const ghConfig = config.githubUrl ? url.parse(config.githubUrl) : {};

const github = new GitHubApi({
  port: ghConfig.port,
  protocol: (ghConfig.protocol || '').split(':')[0] || null,
  host: ghConfig.hostname,
  pathPrefix: config.githubApiPathPrefix || null,
});

const ghRepo = parseSlug(pkg.repository.url);

github.authenticate({
  type: 'token',
  token: config.githubToken,
});

const release = {
  owner: ghRepo[0],
  repo: ghRepo[1],
};

github.repos.getLatestRelease(release, (latestReleaseError, response) => {
  if (latestReleaseError) {
    log.error('pre', 'Failed to determine latest release.', latestReleaseError);
    process.exit(1);
  }

  const latestRelease = Object.assign({},
    release,
    {
      id: response.id,
    }
  );

  glob(`${config.assetFolder}/**/*`, (globError, matches) => {
    if (globError) {
      log.error('glob', 'Failed to find assets to upload.', globError);
      process.exit(1);
    }

    matches.forEach((filePath) => {
      const asset = Object.assign({},
        latestRelease,
        filePath,
        {
          name: path.basename(filePath),
        }
      );

      github.repos.uploadAsset(asset, (uploadError) => {
        log.error('upload', `Failed to upload ${filePath}.`, uploadError);
      });
    });
  });
});
