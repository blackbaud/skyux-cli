/*jshint node: true*/
'use strict';

const path = require('path');
const promptly = require('promptly');
const clone = require('git-clone');
const fs = require('fs-extra');
const spawn = require('child_process').spawn;

const templateRepoUrl = 'https://github.com/blackbaud/sky-pages-template-skyux2';

module.exports = function () {
  let repoUrl;
  let spaName;

  function completeSpa() {
    const projectName = 'sky-pages-spa-' + spaName;
    const folderName = path.join('.', projectName);

    function fixUpPackageJson() {
      let packageJson = fs.readJsonSync(path.join(folderName, 'package.json'));
      packageJson.name = `blackbaud-sky-pages-spa-${spaName}`;
      packageJson.description = `Single-page-application for ${spaName}`;

      if (repoUrl) {
        packageJson.repository = {
          type: 'git',
          url: repoUrl
        };
      }

      fs.writeJsonSync(path.join(folderName, 'package.json'), packageJson);
    }

    function npmInstall(callback) {
      const npmProcess = spawn('npm', ['install'], { cwd: folderName, stdio: 'inherit' });

      npmProcess.on('exit', function () {
        callback();
      });
    }

    function cloneComplete(err) {
      if (err) {
        console.error(err);
      } else {
        fs.remove(path.join(spaName, '.git'));

        fixUpPackageJson();

        console.log('Installing NPM dependencies...');

        npmInstall(() => {
          console.log(`SPA project ${projectName} created successfully.`);
        });
      }
    }

    console.log(`Cloning template into ${projectName}...`);

    clone(templateRepoUrl, folderName, cloneComplete);
  }

  function getRepoUrl(err, value) {
    repoUrl = value;

    completeSpa();
  }

  function getSpaName(err, value) {
    spaName = value;

    promptly.prompt(
      'What is the URL to your repo? (leave this blank if you don\'t know)',
      getRepoUrl
    );
  }

  promptly.prompt(
    'What is the root directory for your SPA? (example: my-spa-name)',
    {
      validator: (value) => {
        if (!value || !value.match(/^[a-z0-9\-]*$/)) {
          throw new Error(
            'SPA root directories may only contain lower-case letters, numbers or dashes.'
          );
        }

        return value;
      }
    },
    getSpaName
  );
};
