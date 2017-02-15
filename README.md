# skyux-cli

[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-cli.svg)](https://www.npmjs.com/package/@blackbaud/skyux-cli)
[![status](https://travis-ci.org/blackbaud/skyux-cli.svg?branch=master)](https://travis-ci.org/blackbaud/skyux-cli)

The command line interface for the SKY UX Builder.

## Installation

- Ensure that you have Node v6+ and NPM v3+. To verify this, run `node -v` and `npm -v` at the command line.
- For Mac OS X, we recommend that you use [Node Version Manager (nvm)](https://github.com/creationix/nvm) to wrap your NodeJS installation so that it installs in your user directory and avoids permission-related issues. 
- From the command line, run `npm install @blackbaud/skyux-cli -g`.

### Install SSL Certificate
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

## Available Commands

- `skyux serve`
- `skyux build`
- `skyux help` or `skyux -h`
- `skyux version` or `skyux -v`
- `skyux test`
- `skyux watch`
- `skyux e2e`

## Available Options

- `-l` or `--launch` &mdash; Specifies which URL to launch when `skyux serve` runs. For example, `skyux serve --launch local` launches the local URL. The available options are `none`, which stops any URL from launching, `local`, and `host`, which launches the host URL and is the default value.

## Configuration

In your project's directory, you can use a `skyuxconfig.json` file to configure certain aspects of the SKY UX process.  Some of the values are defined in SKY UX Builder and will not be included in the default `skyuxconfig.json` that comes from running `skyux new`.

- `name`: The "name" of your project when running in SKY UX Host.  For example "demo" would mean your SPA is accessible from `https://sky.blackbaud-dev.com/demo`.  This property is optional and by default, this property is read from your `package.json` file.
- `mode`: Allows you to control how much boilerplate code is automatically generated. This property will eventually become obsolete as the CLI continues to be built, where individual steps are overridable without having to switch completely into advanced mode.  Possible values are `easy` (default) or `advanced`.
- `compileMode`: Configure ahead-of-time or just-in-time compilation.  Possible values are `aot` (default) or  `jit`.
- `host`: Configuration options related to communication with SKY UX Host.
  - `url`: Base URL used when passing information from `skyux serve` to the SKY UX Host.  It would be very uncommon to change this.  Default is `https://sky.blackbaud-dev.com`
- `app`: Configuration options related to the local app when running `skyux serve`.
  - `title`: Prior to having Angular2 set the page title, this property is used at the template level to control the title.  Default is `Blackbaud - SKY UX Application`  You can also control the title via the [title service](https://angular.io/docs/ts/latest/cookbook/set-document-title.html).
- `auth`: Enables your project to require authenticated Blackbaud ID.  Possible values are `false` (default) or `true`.  Checkout the `auth-client` section in helpers to learn about making authenticated http requests.
- `omnibar`: An object that's passed to Omnibar's `load` method. Learn more about available options for passing to the [Omnibar](http://authsvc.docs.blackbaudhosting.com/components/omnibar/configuration_options/).
- `help`: Automatically includes the Help Widget in your project.  Possible values are `false` (default) or `true`.
- `externals`: Use this object to dynamically inject CSS and JS files into the host.  There should be a specific use-case for using an external, such as how Office Addins require their library to be loaded via CDN in the head.  Below is an example showing all the configuration options:

```
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
```

## Helpers

- `import { SkyAuthHttp } from '@blackbaud/skyux-builder/runtime'` In conjunction with `auth: true` in your `skyuxconfig.json` file, we've provided a wrapper to the `http` utility class.  Using `SkyAuthHttp.get()` will automatically add the necessary Authorization header containing the bearer token received from authentication.
- `import { SkyHostBrowser } from '@blackbaud/skyux-builder/runtime/testing'` Particularly useful when running `skyux e2e`, use `SkyHostBrowser.get()` to automatically add the SKY UX Host base url, as well as the necessary configuration object to enable local development mode.  For example, `SkyHostBrowser.get(/my-page?my-qs=1');`

## Testing

### Unit Testing

We automatically configure [Karma](https://karma-runner.github.io) to run unit tests matching the  `*.spec.ts` pattern.  We suggest following the [Angular2 Style Guide](https://angular.io/styleguide#!#naming) regarding what to name your spec files and where to store them.  Checkout the example included in our template via `skyux new` (coming soon) or learn more about [writing unit tests](https://angular.io/docs/ts/latest/testing/) in SKY UX.

Use `skyux test` to run your tests, or `skyux watch` everytime you make a change to a spec file.

### End-to-End (e2e) Testing

We automatically configure [Protractor](http://www.protractortest.org) to run end-to-end tests matching the `e2e/*.e2e-spec.ts` pattern.  Checkout the example include in our template via `skyux new` (coming soon) or learn more about [writing end-to-end tests](https://angular.io/docs/ts/latest/testing/) in SKY UX.

Use `skyux e2e` to run your tests.
