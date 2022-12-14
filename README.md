<h1>Te Reo Tooltips Module</h1>
This module provides the ability to configure custom translations for use within the TinyMCE 4 text editor of the SilverStripe 4 CMS.

<h2>How to use</h2>
Installing this module will generate a 'Dictionaries' menu under site settings,
from here you can set up what words you would like to translate.
Once configured, you will be able to quickly translate these words within TinyMCE.
In the CMS, words will retain their their original form, but with a dashed underline to mark them out.
On the front-end, translated words will generate a tooltip that indicates their original meaning.
The tooltips are generated dynamically on page-load, so will reflect the dictionary that is currently selected in the settings menu.

See the [userguide](docs/en/userguide.md) for futher detail.

## Requirements

* SilverStripe ^4.0
* [Yarn](https://yarnpkg.com/lang/en/), [NodeJS](https://nodejs.org/en/) (6.x) and [npm](https://npmjs.com) (for building
  frontend assets)
* TinyMCE 4

## Installation
Install via [composer](https://getcomposer.org)

```JSON

    "require": {
        "signify-nz/te-reo-tooltips": "^1"
    },
    "repositories": [
        {
            "type": "vcs",
            "url":  "git@github.com:signify-nz/te-reo-tooltips.git"
        }
    ]

```

Once installed, run dev/build?flush=1

As this is a private repository, you will need to authenticate in order to access it.

## License
See [License](license.md)

## Example configuration
This module allows a custom background colour for generated tooltips.
This should be entered into the config.yml file as below.
By entering a value here, the custom colour theme is enabled automatically.
The default value for this field is 0, which disables the feature.

```yaml

Signify\TeReoTooltips\SiteTreeExtension:
      custom_hexcode:
        '#D34324'

```

## CSS/JS Development
### Setup
For development you will need Node.js and yarn installed.

Next, you need to install the required npm packages.
```bash
yarn install
```
### Compiling assets
You can compile assets using `yarn watch`.

Produce minified (production) files using `yarn package`.

### Linting
Check over your JavaScript and SASS source code individually:

```bash
yarn lint-js
yarn lint-sass
```

You can also lint both in a single command:
```bash
yarn lint
```

## Testing
To run tests, use the following command
```bash
vendor/bin/phpunit vendor/signify-nz/te-reo-tooltips/tests/
```

## Maintainers
 * Morgan Middleton <morgan.middleton@signify.co.nz>

## Bugtracker
Bugs are tracked in the issues section of this repository. Before submitting an issue please read over
existing issues to ensure yours is unique.

If the issue does look like a new bug:

 - Create a new issue
 - Describe the steps required to reproduce your issue, and the expected outcome. Unit tests, screenshots
 and screencasts can help here.
 - Describe your environment as detailed as possible: SilverStripe version, Browser, PHP version,
 Operating System, any installed SilverStripe modules.

Please report security issues to the module maintainers directly. Please don't file security issues in the bugtracker.

## Development and contribution
If you would like to make contributions to the module please ensure you raise a pull request and discuss with the module maintainers.

[Contributing](CONTRIBUTING.md)
