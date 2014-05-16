# Zaz: Simple Node.js deployment, Capistrano-style

[![Build Status](https://travis-ci.org/bredikhin/zaz.png?branch=master)](https://travis-ci.org/bredikhin/zaz)
[![NPM version](https://badge.fury.io/js/zaz.png)](http://badge.fury.io/js/zaz)

## Why?

In order to set up simple project deployment with minimum
configuration/programming.

## More opinionated than flexible

Currently, the tool conforms to the following assumptions:

- the code is being fetched from a Git repositories, accessible from the
remote servers;
- ssh key (`~/.ssh/id_rsa.pub`) is being used for authentication;
- the `package.json` has the following npm scripts described: `start`,
`status`, `stop`, `deploy` (to use with
[Naught](https://github.com/andrewrk/naught), for example);
- some more.

## Installation

`sudo npm install -g zaz`

[![NPM](https://nodei.co/npm/zaz.png)](https://nodei.co/npm/zaz/)

## Configuration

Place somewhere (in your project root, for example) a file named `zaz.json`
with the following structure:

```json
{
  "stages": {
    "staging": {
      "user": "<deployer username>",
      "git": "<git repo containing the code>",
      "path": "<where to put the folder structure on your remote server>",
      "hosts": [
        "<your remote staging host 1>",
        ...
        "<your remote staging host n>"
      ]
    },
    "production": {
      ...
    }
  }
}
```

## Usage

`zaz <stage>` looks for `zaz.json` and performs the deployment according


## Dependencies

- [ssh2](https://www.npmjs.org/package/ssh2),
- [commander](https://www.npmjs.org/package/commander),
- [lodash](https://www.npmjs.org/package/lodash),
- [async](https://www.npmjs.org/package/async),
- [path-extra](https://www.npmjs.org/package/path-extra),
- [colors](https://www.npmjs.org/package/colors).

## Contributions

* are welcome;
* should be tested;
* should follow the same coding style.

Keep it simple, minimum bells and whistles, please.

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 [Ruslan Bredikhin](http://www.ruslanbredikhin.com/)
