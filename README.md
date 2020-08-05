# authheaders

[![build status](https://img.shields.io/travis/com/forwardemail/authheaders.svg)](https://travis-ci.com/forwardemail/authheaders)
[![code coverage](https://img.shields.io/codecov/c/github/forwardemail/authheaders.svg)](https://codecov.io/gh/forwardemail/authheaders)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/forwardemail/authheaders.svg)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/authheaders.svg)](https://npm.im/authheaders)

> Node.js wrapper around the Python pip package [authheaders][] exposing a function to generate Authentication-Results headers


## Table of Contents

* [Requirements](#requirements)
* [Install](#install)
* [Usage](#usage)
  * [authenticateMessage](#authenticatemessage)
* [Contributors](#contributors)
* [License](#license)


## Requirements

1. Ensure that you have a Python version of >= 3.5 installed per [authheaders][] requirements (note that Python v3 is required because of a bug with DNS recursive CNAME lookups on v2.7):

   ```sh
   python3 --version
   ```

2. Install the package [authheaders][] from our fork which contains a fix (until <https://github.com/ValiMail/authentication-headers/pull/6> is merged and released):

   ```sh
   pip3 install git+https://github.com/forwardemail/authentication-headers.git
   ```

3. Install [dnspython](https://github.com/rthalley/dnspython) v1.16.0:

   ```sh
   pip3 install dnspython==1.16.0
   ```

4. Install [pyspf](https://pypi.org/project/pyspf/):

   ```sh
   pip3 install pyspf
   ```


## Install

[npm][]:

```sh
npm install authheaders
```

[yarn][]:

```sh
yarn add authheaders
```


## Usage

### authenticateMessage

```js
const fs = require('fs');

const { authenticateMessage } = require('authheaders');

const message = fs.readFileSync('/path/to/example.eml');
const selector = 'default'; // default._domainkey
const domain = 'example.com';
const srvId = 'mx.example.com';
const privateKeyFile = '/path/to/private.key';

// then/catch usage
authenticateMessage(message, selector, domain, privateKeyFile, srvId)
  .then(console.log)
  .catch(console.error);

// async/await usage
(async () => {
  try {
    const result = await authenticateMessage(message, authservId, ip, mailFrom, helo);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();
```

The value of `result` is an String with the new Authentication-Results header to add to the top of the message headers.


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com/)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[authheaders]: https://pypi.org/project/authheaders/
