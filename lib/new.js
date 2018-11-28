/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const clone = require('git-clone');
const promptly = require('promptly');
const spawn = require('cross-spawn');
const logger = require('@blackbaud/skyux-logger');
const latestVersion = require('latest-version');

const npmInstall = require('./npm-install');

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
const settings = {
  stdio: logger.logLevel === 'verbose' ? 'inherit' : 'ignore'
};

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
 * Checkout a new branch.
 * @name checkoutBranch
 */
const checkoutBranch = () => {

  if (!settings.url) {
    return Promise.resolve();
  }

  const message = logger.promise('Switching to branch initial-commit.');
  const npmProcess = spawn('git', ['checkout', '-b', 'initial-commit'], {
    cwd: settings.path,
    stdio: settings.stdio
  });

  return new Promise((resolve, reject) => {
    npmProcess.on('exit', (code) => {
      if (code !== 0) {
        message.fail();
        reject('Switching to branch initial-commit failed.');
        return;
      }

      message.succeed();
      resolve();
    });
  });
};

/**
 * Sets the latest versions of skyux + skyux-builder and to the package.json.
 */
const getLatestVersions = () => Promise.all([
  latestVersion('@blackbaud/skyux'),
  latestVersion('@blackbaud/skyux-builder')
]);

/**
 * Removes the .git folder. Fixes package.json.
 * @name cleanupTemplate
 */
const cleanupTemplate = (skyux, builder) => {

  const packagePath = path.join(settings.pathTmp, 'package.json');

  return new Promise((resolve, reject) => {
    const packageJson = fs.readJsonSync(packagePath);
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.peerDependencies = packageJson.peerDependencies || {};

    if (settings.template.name === 'library') {
      packageJson.peerDependencies['@blackbaud/skyux'] = `^${skyux}`;
      packageJson.devDependencies['@blackbaud/skyux'] = skyux;
      // Ensure libraries do not have a hard dependency on SKY UX.
      delete packageJson.dependencies['@blackbaud/skyux'];
    } else {
      packageJson.dependencies['@blackbaud/skyux'] = skyux;
    }

    packageJson.devDependencies['@blackbaud/skyux-builder'] = builder;

    packageJson.name = `blackbaud-${settings.name}`;
    packageJson.description = `Single-page-application for ${settings.name}`;
    packageJson.repository = {
      type: 'git',
      url: settings.url
    };

    logger.info(`Setting @blackbaud/skyux version ${skyux}`);
    logger.info(`Setting @blackbaud/skyux-builder version ${builder}`);

    try {
      fs.writeJsonSync(packagePath, packageJson, { spaces: 2 });
      fs.removeSync(path.join(settings.pathTmp, '.git'));
      fs.copySync(settings.pathTmp, settings.path, { mkdirp: true, clobber: true });
      fs.removeSync(settings.pathTmp);
      resolve();
    } catch (err) {
      logger.info('Template cleanup failed.');
      reject(err);
    }
  });
};

/**
 * Clone the template into a temp path.
 * @name cloneTemplate
 */
const cloneTemplate = () => {
  const message = logger.promise(`Cloning ${settings.template.name} SKY UX template.`);
  return new Promise((resolve, reject) => {
    clone(settings.template.url, settings.pathTmp, (err) => {
      if (err) {

        message.fail(`Template not found at location, ${settings.template.url}.`);
        reject(err);
        return;
      }

      message.succeed(`${settings.template.name} template successfully cloned.`);
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
    const message = logger.promise('Cloning your repository.');
    clone(settings.url, settings.path, (err) => {
      if (err) {
        message.fail();
        reject(err);
        return;
      }

      if (!isRepoEmpty(settings.path)) {
        message.fail();
        reject('skyux new only works with empty repositories.');
        return;
      }

      message.succeed();
      resolve();
    });
  });
};

/**
 * Prompts for the project's root repo URL.
 * @name promptForUrl
 */
const promptForUrl = (args) => {
  const message = 'What is the URL to your repo? (leave this blank if you don\'t know)';
  const save = (url) => {
    settings.url = url;
    return Promise.resolve();
  };

  if (args.repo === false) {
    return save('');
  }

  if (args.repo) {
    return save(args.repo);
  }

  return promptly.prompt(message, { 'default': '' })
    .then((value) => save(value));
};

/**
 * Prompts for the project's root directory name.
 * @name promptForName
 */
const promptForName = (args) => {
  const validator = (value) => {
    const packageName = getPackageName(value);

    if (!value || !value.match(/^[a-z0-9\-]*$/)) {
      logger.error(
        'SPA root directories may only contain lower-case letters, numbers or dashes.'
      );
      throw new Error();
    } else if (fs.existsSync(path.join('.', packageName))) {
      logger.error('SPA directory already exists.');
      throw new Error();
    }

    logger.info(`Creating a new SPA named '${packageName}'.`);
    return value;
  };

  const prompt = () => {
    const message = 'What is the root directory for your SPA? (example: my-spa-name)';
    return promptly.prompt(message, { validator })
      .then(success);
  };

  const success = (value) => {
    settings.spa = value;
    settings.name = getPackageName(value);
    settings.path = path.join('.', settings.name);
    settings.pathTmp = path.join(settings.path, 'tmp');

    return Promise.resolve(value);
  };

  if (args.name) {
    try {
      return success(validator(args.name));
    } catch (err) {
      logger.error(err.message);
      return prompt();
    }
  } else {
    return prompt();
  }
};

/**
 * Returns a string to be used for the name property in package.json.
 * @name getPackageName
 */
const getPackageName = (name) => {
  let prefix;

  switch (settings.template.name) {
    case 'library':
      prefix = 'lib';
      break;
    default:
      prefix = 'spa';
      break;
  }

  return `skyux-${prefix}-${name}`;
};

/**
 * Returns an object representing the template config, derived
 * from constructor arguments.
 * @name getTemplateFromArgs
 */
const getTemplateFromArgs = (args) => {
  let name = 'default';
  let url = 'https://github.com/blackbaud/skyux-template';

  if (args.t) {
    args.template = args.t;
  }

  // Checks if the flag is paired with a string.
  // (If the flag is provided without the string, it will return `true`.)
  if (typeof args.template === 'string') {
    name = args.template;
    if (args.template.indexOf(':') > -1) {
      url = args.template;
    } else {
      url = `${url}-${name}`;
    }
  }

  return Object.freeze({ name, url });
};

const notify = () => {
  logger.info('SPA %s created in directory %s', settings.spa, settings.name);
  logger.info('Change into that directory and run "skyux serve" to begin.');
  return Promise.resolve();
};

/**
 * ENTRY POINT
 */
module.exports = (args) => {
  settings.template = getTemplateFromArgs(args);

  return promptForName(args)
    .then(() => promptForUrl(args))
    .then(cloneRepo)
    .then(cloneTemplate)
    .then(getLatestVersions)
    .then((v) => cleanupTemplate(v[0], v[1]))
    .then(checkoutBranch)
    .then(() => npmInstall(settings))
    .then(notify)
    .catch(logger.error);
};
