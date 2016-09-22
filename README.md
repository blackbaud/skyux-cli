# sky-pages-cli
The command-line interface for the SKY Pages Builder.

## Installation

- Ensure you have Node v6+ and NPM v3+ (you can verify this by running `node -v` and `npm -v` at the command line)
- From the command line run `npm install https://github.com/blackbaud/sky-pages-cli -g`

### Installing SSL Certificate
In order to load your local SPA into the SKY Pages Host you will need to add a certificate to your computer's Trusted Roots list.

- Navigate to https://github.com/blackbaud/sky-pages-out-skyux2/tree/master/ssl and download `server.crt`.

#### On Mac OS X

- Open the Keychain Access application.  Under the Keychains list on the left, select "login" and then under the Category list select "Certificates."
- Drag `server.crt` into the list of certificates.
- Double-click the new "localhost" item that should now be in the list to open the certificate's info window.
- Expand the Trust section near the top of the info window, then select "Always Trust" option for "Secure Sockets Layer (SSL)".
- Close the info window.

## Usage

To create a new SKY Pages SPA:

- From the command line `cd` into a directory where your new project is to be created.
- Run `sky-pages new` and answer the prompts.
- Once the process completes there will be a new folder called `sky-pages-spa-<name-of-root-dir>` where `name-of-root-dir` is what you specified in the first prompt.  `cd` into this directory and run `sky-pages serve`.  This will open the SKY Pages Host site in your default browser and run your SPA.
- As you make changes to your project the browser should reload your page automatically.

## Available Commands

- `sky-pages serve`
- `sky-pages build`
- `sky-pages version`

## Available Options

`--noOpen` - Stop the host URL from opening when running `sky-pages serve`
