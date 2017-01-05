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
const templateRepoUrl = 'https://github.com/blackbaud/skyux-template';
const settings = {};
let argv;

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
  npmProcess.on('exit', function () {
    logger.info('SPA %s created in directory %s', settings.spa, settings.name);
    logger.info('Change into that directory and run "skyux serve" to begin.');
  });
};

/**
 * Removes the .git folder.  Fixes package.json.
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
  fs.copy(settings.pathTmp, settings.path,  { mkdirp: true, clobber: true }, (err) => {
    if (err) {
      logger.error(err);
    } else {
      fs.removeSync(settings.pathTmp);
      npmInstall();
    }
  });
};

/**
 * Clone the template is a temp path.
 * @name cloneTemplate
 */
const cloneTemplate = () => {
  logger.info('Cloning SKY Pages template.');
  clone(templateRepoUrl, settings.pathTmp, (err) => {
    if (err) {
      logger.error(err);
    } else {
      cleanupTemplate();
    }
  });
};

/**
 * Clones the repo into the specified path
 * @name cloneRepo
 */
const cloneRepo = () => {
  logger.info('Cloning your repository.');
  clone(settings.url, settings.path, (err) => {
    if (err) {
      logger.error(err);
    } else {
      if (!isRepoEmpty(settings.path)) {
        logger.info('skyux new only works with empty repositories.');
      } else {
        cloneTemplate();
      }
    }
  });
};

/**
 * Prompts for the repo URL.
 * @name promptForUrl
 */
const promptForUrl = () => {
  promptly.prompt(
    'What is the URL to your repo? (leave this blank if you don\'t know)',
    {
      'default': ''
    },
    (err, value) => {
      settings.url = value;
      if (settings.url) {
        cloneRepo();
      } else {
        cloneTemplate();
      }
    }
  );
};

/**
 * Prompts for the name.
 * @name promptForName
 */
const promptForName = (args) => {

  // Globally save any arguments
  argv = args;

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

  // No need to check for err since we're using a validator
  const handler = (err, value) => {
    settings.spa = value;
    settings.name = 'skyux-spa-' + value;
    settings.path = path.join('.', settings.name);
    settings.pathTmp = path.join(settings.path, 'tmp');
    promptForUrl();
  };

  promptly.prompt(prompt, { validator: validator }, handler);
};

/**
 * ENTRY POINT
 */
module.exports = promptForName;
