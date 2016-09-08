# sky-pages-cli
The command-line interface for the SKY Pages Builder.

## Installation

- Ensure you have Node v6+ and NPM v3+ (you can verify this by running `node -v` and `npm -v` at the command line)
- From the command line run `npm install https://github.com/blackbaud/sky-pages-cli -g`
 
## Usage

To create a new SKY Pages SPA:

- From the command line `cd` into a directory where your new project is to be created.
- Run `sky-pages new` and answer the prompts.
- Once the process completes there will be a new folder called `sky-pages-spa-<name-of-root-dir>` where `name-of-root-dir` is what you specified in the first prompt.  `cd` into this directory and run `sky-pages serve`.
- Open a web browser and navigate to `https://localhost:31337/<name-of-root-dir>/`.
- As you make changes to your project the browser should reload your page automatically.
