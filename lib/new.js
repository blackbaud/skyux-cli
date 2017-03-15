/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const clone = require('git-clone');
const promptly = require('promptly');
const spawn = require('cross-spawn');
const logger = require('winston');

/**
* Prompt for spa name
* Prompt for Git URL
* IF Git URL provided
*   Clone from Git URL into destination.
*   Confirm repo is empty, except for .git folder (and maybe README.md)
* Clone from template into temp folder.
* Copy contents of temp folder into destination (except for .git folder, and maybe README.md)
* Adjust package.json file.
* Run npm install
*/
const templateRepoBaseUrl = 'https://github.com/blackbaud/skyux-template';
const settings = {};

/**
 * Verifies path is empty, execpt for README.md and .git folder
 * @name isRepoEmpty
 * @returns {Boolean} isPathEmpty
 */
const isRepoEmpty = (dir) => {
  const files = fs.readdirSync(dir);
  let isEmpty = true;
  files.forEach((file) => {
    if (file.indexOf('.git') === -1 && file.indexOf('README.md') === -1) {
      isEmpty = false;
    }
  });
  return isEmpty;
};

/**
 * Runs npm install
 * @name npmInstall
 */
const npmInstall = () => {
  logger.info('Running npm install');
  const npmProcess = spawn('npm', ['install'], { cwd: settings.path, stdio: 'inherit' });
  return new Promise((resolve) => {
    npmProcess.on('exit', () => {
      logger.info('SPA %s created in directory %s', settings.spa, settings.name);
      logger.info('Change into that directory and run "skyux serve" to begin.');
      resolve();
    });
  });
};

/**
 * Removes the .git folder. Fixes package.json.
 * @name cleanupTemplate
 */
const cleanupTemplate = () => {
  const packagePath = path.join(settings.pathTmp, 'package.json');
  let packageJson = fs.readJsonSync(packagePath);
  packageJson.name = `blackbaud-${settings.name}`;
  packageJson.description = `Single-page-application for ${settings.name}`;

  if (settings.url) {
    packageJson.repository = {
      type: 'git',
      url: settings.url
    };
  }

  fs.writeJsonSync(packagePath, packageJson);
  fs.removeSync(path.join(settings.pathTmp, '.git'));

  return new Promise((resolve, reject) => {
    fs.copy(settings.pathTmp, settings.path, { mkdirp: true, clobber: true }, (err) => {
      if (err) {
        console.log('Error! cleanupTemplate', err);
        return reject(err);
      }

      fs.removeSync(settings.pathTmp);
      resolve();
    });
  });
};

/**
 * Clone the template into a temp path.
 * @name cloneTemplate
 */
const cloneTemplate = () => {
  logger.info('Cloning SKY UX template.', settings);
  return new Promise((resolve, reject) => {
    clone(settings.templateRepoUrl, settings.pathTmp, (err) => {
      if (err) {
        console.log('Error, cloneTemplate!', err);
        logger.error(`Template not found at location, ${settings.templateRepoUrl}.`);
        return reject(err);
      }

      resolve();
    });
  });
};

/**
 * Clones the repo into the specified path
 * @name cloneRepo
 */
const cloneRepo = () => new Promise((resolve, reject) => {
  if (!settings.url) {
    return resolve();
  }

  logger.info('Cloning your repository.');
  clone(settings.url, settings.path, (err) => {
    if (err) {
      console.log('Error! cloneRepo', err);
      reject(err);
      return;
    }

    if (!isRepoEmpty(settings.path)) {
      logger.info('skyux new only works with empty repositories.');
      return;
    }

    resolve();
  });
});

/**
 * Prompts for the project's root repo URL.
 * @name promptForUrl
 */
const promptForUrl = () => {
  const prompt = 'What is the URL to your repo? (leave this blank if you don\'t know)';
  return promptly.prompt(prompt, { 'default': '' })
    .then((value) => {
      settings.url = value;
      return Promise.resolve(value);
    });
};

/**
 * Prompts for the project's root directory name.
 * @name promptForName
 */
const promptForName = () => {
  const prompt = 'What is the root directory for your SPA? (example: my-spa-name)';
  const validator = (value) => {
    if (!value || !value.match(/^[a-z0-9\-]*$/)) {
      throw new Error(
        'SPA root directories may only contain lower-case letters, numbers or dashes.'
      );
    } else if (fs.existsSync(path.join('.', 'skyux-spa-' + value))) {
      throw new Error(
        'SPA directory already exists.'
      );
    }

    return value;
  };

  return promptly.prompt(prompt, { validator: validator })
    .then((value) => {
      settings.spa = value;
      settings.name = 'skyux-spa-' + value;
      settings.path = path.join('.', settings.name);
      settings.pathTmp = path.join(settings.path, 'tmp');
      return Promise.resolve(value);
    });
};

/**
 * ENTRY POINT
 */
module.exports = (args) => {
  const templateRequested = (args && args.template && args.template !== true);
  if (templateRequested) {
    settings.templateRepoUrl = `${templateRepoBaseUrl}-${args.template}`;
  } else {
    settings.templateRepoUrl = `${templateRepoBaseUrl}`;
  }

  promptForName()
    .then(() => promptForUrl())
    .then(() => cloneRepo())
    .then(() => cloneTemplate())
    .then(() => cleanupTemplate())
    .then(() => npmInstall())
    .catch(err => logger.error(err));
};
