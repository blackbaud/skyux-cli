/*jshint node: true*/
'use strict';

const promptly = require('promptly');
const clone = require('git-clone');
const fs = require('fs-extra');

module.exports = function () {
  function getSpaName(err, value) {
    value = value.toLowerCase().replace(/\-/gi, ' ' + '-');

    const projectName = 'sky-pages-spa-' + value;
    const folderName = './' + projectName;

    console.log('Cloning boilerplate into ' + projectName + '...');

    clone(
      'https://github.com/blackbaud/sky-pages-boilerplate-skyux2',
      './sky-pages-spa-' + value,
      () => {
        fs.remove('./' + value + '/.git');
        console.log('SPA project ' + projectName + ' created successfully.');
      }
    );
  }

  promptly.prompt(
    'What is the name of your SPA?',
    getSpaName
  );
};
