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

1. Ensure that you have a Python version of >= 3.6 installed.

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
const authservId = 'mx.example.com';
const ip = '1.2.3.4';
const mailFrom = 'example.net';
const helo = 'domain.of.sender.example.net';

// then/catch usage
authenticateMessage(message, authservId, ip, mailFrom, helo)
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

The value of `result` is an Object with properties `header` (String), and Objects for `spf`, `dkim`, `arc`, and `dmarc`.

These Objects contain a `result` (String) and conditionally a `reason` (String) value.

An example `result` object is provided below:

```js
{
  header: 'Authentication-Results: example.com; spf=none smtp.helo=domain.of.sender.net smtp.mailfrom=test.com; dkim=pass header.d=forwardemail.net; arc=pass; dmarc=fail (Used From Domain Record) header.from=gmail.com policy.dmarc=none',
  spf: { result: 'none' },
  dkim: { result: 'pass' },
  arc: { result: 'pass' },
  dmarc: { policy: 'none', result: 'fail', reason: 'Used From Domain Record' }
}
```


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
