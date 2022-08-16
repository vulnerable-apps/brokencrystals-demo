const detectPort = require('detect-port');
const dockerCompose = require('docker-compose');
const { config } = require('dotenv');
const { join } = require('path');
const { promisify } = require('util');

const expectApp = async ({ container, cwd }) => {
  const curl = [
    'curl',
    '--output',
    '/dev/null',
    '--silent',
    '--retry',
    10,
    '--retry-delay',
    5,
    '--retry-connrefused',
    'http://localhost:3000/api/config'
  ].join(' ');

  let max = 10;

  for (;;) {
    try {
      return await dockerCompose.exec(container, ['sh', '-c', curl], {
        cwd
      });
    } catch (e) {
      // eslint-disable-next-line max-depth
      if (max <= 0) {
        throw e;
      }

      max--;
      await promisify(setTimeout)(5000);
    }
  }
};

module.exports = async () => {
  const port = 3000;
  const freePort = await promisify(detectPort)(port);
  const cwd = join(__dirname, '..');

  config();

  if (freePort === port) {
    await dockerCompose.upAll({
      cwd,
      log: true
    });

    await expectApp({ container: 'brokencrystals.api', cwd });
  }
};
