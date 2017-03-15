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
  npmProcess.on('exit', () => {
    logger.info('SPA %s created in directory %s', settings.spa, settings.name);
    logger.info('Change into that directory and run "skyux serve" to begin.');
  });

  return Promise.resolve();
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
        reject(err);
        return;
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
  logger.info(`Cloning ${settings.template.name} SKY UX template.`);
  return new Promise((resolve, reject) => {
    clone(settings.template.repoUrl, settings.pathTmp, (err) => {
      if (err) {
        logger.info(`Template not found at location, ${settings.template.repoUrl}.`);
        reject(err);
        return;
      }

      logger.info(`${settings.template.name} template successfully cloned.`);
      resolve();
    });
  });
};

/**
 * Clones the repo into the specified path
 * @name cloneRepo
 */
const cloneRepo = () => {
  if (!settings.url) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    logger.info('Cloning your repository.');
    clone(settings.url, settings.path, (err) => {
      if (err) {
        reject(err);
        return;
      }

      if (!isRepoEmpty(settings.path)) {
        reject('skyux new only works with empty repositories.');
        return;
      }

      resolve();
    });
  });
};

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
 * Returns an object representing the template config, derived
 * from constructor arguments.
 * @name getTemplateFromArgs
 */
const getTemplateFromArgs = (args) => {
  const templateNameProvided = (args && args.template && args.template !== true);
  let template = {
    name: 'default',
    repoUrl: templateRepoBaseUrl
  };

  if (templateNameProvided) {
    template = {
      name: args.template,
      repoUrl: `${templateRepoBaseUrl}-${args.template}`
    };
  }

  return template;
};

/**
 * ENTRY POINT
 */
module.exports = (args) => {
  settings.template = getTemplateFromArgs(args);

  return promptForName()
    .then(() => promptForUrl())
    .then(() => cloneRepo())
    .then(() => cloneTemplate())
    .then(() => cleanupTemplate())
    .then(() => npmInstall())
    .catch(err => logger.error(err));
};
