# skyux-cli
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

From an elevated PowerShell command prompt, change the current directory to the one that you downloaded the skyux-ca.crt to and run this command:

Import-Certificate -FilePath "skyux-ca.crt" -CertStoreLocation Cert:\LocalMachine\Root\

## Usage

To create a SKY UX SPA:

- From the command line, `cd` into the directory where you want to create your new project.
- Run `skyux new` and answer the prompts.
- After the process completes, a new folder called `skyux-spa-<name-of-root-dir>` where `name-of-root-dir` is what you specified in the first prompt. `cd` into this directory and run `skyux serve`. This opens the SKY UX Host site in your default browser and runs your SPA.
- As you save changes to your project, the browser reloads your page automatically.

## Available Commands

- `skyux serve`
- `skyux build`
- `skyux version` or `skyux -v`
- `skyux test`
- `skyux watch`
- `skyux e2e`

## Available Options

- `--noOpen` - Stops the host URL from opening when calling `skyux serve`.
- `--noServe` - Stops the `serve` command from automatically running when calling `skyux e2e`.
