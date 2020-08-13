const path = require('path');
const { exec, execSync } = require('child_process');

const debug = require('debug')('authheaders');
const ms = require('ms');
const semver = require('semver');

const scripts = {
  authenticateMessage: path.join(
    __dirname,
    'scripts',
    'authenticate-message.py'
  )
};

// ensure python installed
try {
  execSync('which python3', {
    stdio: 'ignore',
    encoding: 'utf8',
    timeout: ms('5s')
  });
} catch (err) {
  debug(err);
  throw new Error(`Python v3.5+ is required`);
}

// ensure python v3.5+
const version = semver.coerce(
  execSync('python3 --version', { encoding: 'utf8', timeout: ms('5s') })
    .split(' ')[1]
    .trim()
);

if (!semver.satisfies(version, '>= 3.5'))
  throw new Error(
    `Python v3.5+ is required, you currently have v${version} installed`
  );

const KEYS = ['spf', 'dkim', 'arc', 'dmarc'];

function authenticateMessage(message, ...args) {
  const command = `python3 ${scripts.authenticateMessage} ${args.join(' ')}`;
  debug(command);
  return new Promise((resolve, reject) => {
    const child = exec(command, {
      encoding: 'utf8',
      timeout: ms('10s')
    });
    const stdout = [];
    const stderr = [];
    child.stderr.on('data', (data) => {
      stderr.push(data);
    });
    child.stdout.on('data', (data) => {
      stdout.push(data);
    });
    child.stdin.write(message);
    child.stdin.end();
    child.on('close', () => {
      if (stderr.length > 0) return reject(new Error(stderr.join('')));
      // Authentication-Results: mx1.forwardemail.net; spf=fail reason="SPF fail - not authorized" smtp.helo=jacks-macbook-pro.local smtp.mailfrom=foo@forwardemail.net; dkim=fail; arc=none; dmarc=fail (Used From Domain Record) header.from=forwardemail.net policy.dmarc=reject
      const result = {
        header: stdout.join('').trim().split('Authentication-Results: ')[1]
      };

      // TODO: investigate thie edge case further and follow up with authheaders/dkimpy authors
      if (!result.header)
        return reject(
          new Error(
            `No Authentication-Results header was returned.  Data: ${JSON.stringify(
              { message, stdout, stderr }
            )}`
          )
        );

      for (const key of KEYS) {
        result[key] = {};
      }

      result.dmarc.policy = 'none';

      const terms = result.header
        .split(/;/)
        .map((t) => t.trim())
        .filter((t) => t !== '');

      for (const term of terms) {
        const split = term.split('=');
        if (term.startsWith('spf=')) {
          result.spf.result = split[1].split(' ')[0];
          const index = term.indexOf('reason=');
          if (index !== -1)
            result.spf.reason = term
              .slice(index + 'reason='.length)
              .split('"')[1];
        } else if (term.startsWith('dkim=')) {
          result.dkim.result = split[1].split(' ')[0];
          const index = term.indexOf('(');
          if (index !== -1)
            result.dkim.reason = term.slice(index + '('.length).split(')')[0];
        } else if (term.startsWith('arc=')) {
          result.arc.result = split[1].split(' ')[0];
          // TODO: right now this does not return a comment due to this issue:
          // <https://github.com/ValiMail/authentication-headers/issues/12
        } else if (term.startsWith('dmarc=')) {
          result.dmarc.result = split[1].split(' ')[0];
          // reason
          const index = term.indexOf('(');
          if (index !== -1)
            result.dmarc.reason = term.slice(index + '('.length).split(')')[0];
          // policy
          const policyIndex = term.indexOf('policy.dmarc=');
          if (policyIndex !== -1)
            result.dmarc.policy = term
              .slice(policyIndex + 'policy.dmarc='.length)
              .split(' ')[0];
        }
      }

      resolve(result);
    });
  });
}

module.exports = { authenticateMessage };
