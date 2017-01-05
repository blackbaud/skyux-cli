# skyux-cli
The command-line interface for the SKY UX Builder.

## Installation

- Ensure you have Node v6+ and NPM v3+ (you can verify this by running `node -v` and `npm -v` at the command line)
- From the command line run `npm install @blackbaud/skyux-cli -g`

### Installing SSL Certificate
In order to load your local SPA into the SKY UX Host you will need to add a certificate to your computer's Trusted Roots list.

- Download `server.crt` from https://raw.githubusercontent.com/blackbaud/skyux-builder/master/ssl/server.crt.

#### On Mac OS X

- Open the Keychain Access application.  Under the Keychains list on the left, select "login" and then under the Category list select "Certificates."
- Drag `server.crt` into the list of certificates.
- Double-click the new "localhost" item that should now be in the list to open the certificate's info window.
- Expand the Trust section near the top of the info window, then select "Always Trust" option for "Secure Sockets Layer (SSL)".
- Close the info window.

#### On Windows

- Start Microsoft Management Console (MMC) Tool. Click Start -> Run -> Enter 'MMC' and click 'OK'
- Click File -> Add/Remove Snap-In...
- Add Certificate. ...
- Select 'Computer Account' option and click 'Next'
- Click 'Finish'
- Click 'OK'
- Select the `server.crt` you downloaded from the link above
- Click Next.

## Usage

To create a new SKY UX SPA:

- From the command line `cd` into a directory where your new project is to be created.
- Run `skyux new` and answer the prompts.
- Once the process completes there will be a new folder called `skyux-spa-<name-of-root-dir>` where `name-of-root-dir` is what you specified in the first prompt.  `cd` into this directory and run `skyux serve`.  This will open the SKY UX Host site in your default browser and run your SPA.
- As you make changes to your project the browser should reload your page automatically.

## Available Commands

- `skyux serve`
- `skyux build`
- `skyux version` or `skyux -v`
- `skyux test`
- `skyux watch`
- `skyux e2e`

## Available Options

- `--noOpen` - Stop the host URL from opening when calling `skyux serve`
- `--noServe` - Stops the serve command from automatically running when calling `skyux e2e`
