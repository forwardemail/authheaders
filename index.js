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
      resolve(stdout.join(''));
    });
  });
}

module.exports = { authenticateMessage };
