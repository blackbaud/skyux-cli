# skyux-cli

[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-cli.svg)](https://www.npmjs.com/package/@blackbaud/skyux-cli)
[![status](https://travis-ci.org/blackbaud/skyux-cli.svg?branch=master)](https://travis-ci.org/blackbaud/skyux-cli)

The command line interface for the SKY UX Builder. For documentation on working with the SKY UX CLI, see [the Learn section of the SKY UX 2 website](https://developer.blackbaud.com/skyux2/learn). 

## Installation

- Ensure that you have Node v6+ and NPM v3+. To verify this, run `node -v` and `npm -v` at the command line.
- For Mac OS X, we recommend that you use [Node Version Manager (nvm)](https://github.com/creationix/nvm) to wrap your NodeJS installation so that it installs in your user directory and avoids permission-related issues. 
- From the command line, run `npm install @blackbaud/skyux-cli -g`.

### Install SSL certificate
To load your local SPA into the SKY UX Host, you need to add a certificate to your computer's Trusted Roots list.

- Download the raw [skyux-ca.crt](https://raw.githubusercontent.com/blackbaud/skyux-builder/master/ssl/skyux-ca.crt) root certificate file.

#### On Mac OS X

- Open the Keychain Access application. Under the Keychains list on the left, select "login", and then under the Category list, select "Certificates."
- Drag `skyux-ca.crt` into the list of certificates.
- Double-click the new "SKY UX" item that should now be in the list to open the certificate's info window.
- Expand the Trust section near the top of the info window, then select "Always Trust" option for "Secure Sockets Layer (SSL)".
- Close the info window.

#### On Windows

- Right-click the skyux-ca.crt URL, and select Save As.
- Open the file.
- On the security warning prompt, click Open.
- On the Certificate screen, click Install Certificate.
- On the Certificate Import Wizard, click Next.
- Select Place all certificates in the following store, and then click Browse.
- On the Select Certificate Store screen, select Trusted Root Certification Authorities, and then click OK.
- On the Certificate Import Wizard, click Next.
- Click Finish.
- On the security warning prompt, click Yes.
- On the Certificate Import Wizard confirmation prompt, click OK.
- After you return to the Certificate screen, click OK.

## Usage

To create a SKY UX SPA:

- From the command line, `cd` into the directory where you want to create your new project.
- Run `skyux new` and answer the prompts.
- After the process completes, a new folder called `skyux-spa-<name-of-root-dir>` where `name-of-root-dir` is what you specified in the first prompt. `cd` into this directory and run `skyux serve`. This opens the SKY UX Host site in your default browser and runs your SPA.
- As you save changes to your project, the browser reloads your page automatically.

## Available commands

- `skyux new ` &mdash; Initializes a new SKY UX application.
- `skyux serve` &mdash; Serves the current SKY UX application.
- `skyux build` &mdash; Builds the current SKY UX application into dist/.
- `skyux test` &mdash; Runs unit tests.
- `skyux e2e` &mdash; Runs end-to-end tests.
- `skyux watch` &mdash; Runs unit tests and watches the file system for changes.
- `skyux version` or `skyux -v` &mdash; Returns the version of SKY UX CLI.
- `skyux help` or `skyux -h` &mdash; Displays help information for SKY UX CLI arguments.

## Available options

- `-l` or `--launch` &mdash; Specifies the URL to launch when `skyux serve` runs. For example, `skyux serve --launch local` launches the local URL. The available options are `none`, which stops any URL from launching, `local`, and `host`, which launches the host URL and is the default value.

## Configuration

You can use the `skyuxconfig.json` file in your project's directory to configure certain aspects of the SKY UX process. All properties in `skyuxconfig.json` are optional, and by default, the file specifies values for the `mode` and `compileMode` settings. The `skyuxconfig.json` file does not include all configuration options for SKY UX. SKY UX Builder defines some configuration options that are not included.

- `name`: Specifies the "name" of your project when running in SKY UX Host. For example "demo" would mean your SPA is accessible from `https://sky.blackbaud-dev.com/demo`. By default, this property is read from the `package.json` file with "blackbaud-skyux-spa-" removed.
- `mode`: Allows you to control how much boilerplate code is automatically generated. This property will eventually become obsolete as the CLI continues to be built, where individual steps are overridable without having to switch completely into advanced mode. Possible values are `easy` (default) or `advanced`.
- `compileMode`: Configures ahead-of-time or just-in-time compilation. Possible values are `aot` (default) or  `jit`.
- `host`: Specifies configuration options related to communication with SKY UX Host.
  - `url`: Specifies the base URL used when passing information from `skyux serve` to the SKY UX Host. It would be very uncommon to change this. The default is `https://sky.blackbaud-dev.com`
- `app`: Specifies configuration options related to the local app when running `skyux serve`.
  - `title`: Controls the page title. Before Angular2 sets the title, this property controls the title at the template level. The default title is `Blackbaud - SKY UX Application`. You can also control the title with the [title service](https://angular.io/docs/ts/latest/cookbook/set-document-title.html).
  - `externals`: Dynamically injects CSS and JS files into the host. You should have a specific use-case for an external. For example, Office Addins require their library to be loaded via CDN in the head. The `before` and `after` sections of an external indicate whether to include the external resource before or after the default SKY UX Builder resources. The `head` property, which only applies to JS resources, indicates whether elements are injected within the HTML `head` element or just before the closing `body` tag. Below is an example with all the configuration options:
```
app: {
  externals: {
    css: {
      before: [
        {
          url: 'f1.css',
          integrity: 'ic1'
        }
      ],
      after: [
        {
          url: 'f2.css'
        }
      ]
    },
    js: {
      before: [
        {
          url: 'f1.js',
          integrity: 'ic2',
          head: true
        },
        {
          url: 'f2.js',
          integrity: 'ic3'
        }
      ],
      after: [
        {
          url: 'f3.js'
        }
      ]
    }
  }
}
```
- `auth`: Indicates whether your project requires an authenticated Blackbaud ID. Possible values are `false` (default) or `true`. Check out the `auth-client` section in helpers to learn about making authenticated HTTP requests.
- `omnibar`: Specifies an object that's passed to Omnibar's `load` method. Learn more about available options for passing to the [Omnibar](http://authsvc.docs.blackbaudhosting.com/components/omnibar/configuration_options/).
- `help`: Indicates whether to automatically include the Help Widget in your project. Possible values are `false` (default) or a configuration object. [View Help Widget configuration options.](https://github.com/blackbaud/bb-help#configuration)

## Helpers

- `import { SkyAuthHttp } from '@blackbaud/skyux-builder/runtime'` In conjunction with `auth: true` in your `skyuxconfig.json` file, we've provided a wrapper to the `http` utility class.  Using `SkyAuthHttp.get()` will automatically add the necessary Authorization header containing the bearer token received from authentication.
- `import { SkyHostBrowser } from '@blackbaud/skyux-builder/runtime/testing'` Particularly useful when running `skyux e2e`, use `SkyHostBrowser.get()` to automatically add the SKY UX Host base url, as well as the necessary configuration object to enable local development mode.  For example, `SkyHostBrowser.get(/my-page?my-qs=1');`

## Testing

### Unit testing

We automatically configure [Karma](https://karma-runner.github.io) to run unit tests matching the `*.spec.ts` pattern. We suggest following the [Angular2 Style Guide](https://angular.io/styleguide#!#naming) regarding what to name your spec files and where to store them. Check out the example included in our template via `skyux new` (coming soon) or learn more about [writing unit tests](https://angular.io/docs/ts/latest/testing/) in SKY UX.

Use `skyux test` to run your tests, or `skyux watch` every time you make a change to a spec file.

### End-to-end (e2e) testing

We automatically configure [Protractor](http://www.protractortest.org) to run end-to-end tests matching the `e2e/*.e2e-spec.ts` pattern. Check out the example include in our template via `skyux new` (coming soon) or learn more about [writing end-to-end tests](https://angular.io/docs/ts/latest/testing/) in SKY UX.

Use `skyux e2e` to run your tests.
