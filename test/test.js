const fs = require('fs');
const path = require('path');

const test = require('ava');

const { authenticateMessage } = require('..');

const pass = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'arc-pass.txt'),
  'utf8'
);

const missingFrom = pass
  .split('\n')
  .filter((line) => !line.startsWith('From:'))
  .join('\n');

test('authenticate message throws error', async (t) => {
  await t.throwsAsync(authenticateMessage());
  t.pass();
});

test('authenticate message', async (t) => {
  const result = await authenticateMessage(
    pass,
    'example.com',
    '192.168.50.81',
    'test.com',
    'domain.of.sender.net'
  );

  t.deepEqual(result, {
    arc: {
      result: 'pass'
    },
    dkim: {
      result: 'pass'
    },
    dmarc: {
      policy: 'none',
      reason: 'Used From Domain Record',
      result: 'fail'
    },
    header:
      'example.com; spf=none smtp.helo=domain.of.sender.net smtp.mailfrom=test.com; dkim=pass header.d=forwardemail.net; arc=pass; dmarc=fail (Used From Domain Record) header.from=gmail.com policy.dmarc=none',
    spf: {
      result: 'none'
    }
  });
});

test('arc sign throws error with missing From header', async (t) => {
  await t.throwsAsync(
    authenticateMessage(
      missingFrom,
      'example.com',
      '192.168.50.81',
      'test.com',
      'domain.of.sender.net'
    ),
    { message: /IndexError: list index out of range/g }
  );
});
