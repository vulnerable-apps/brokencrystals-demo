const isCi = require('is-ci');
const dockerCompose = require('docker-compose');
const { join } = require('path');

module.exports = async () => {
  const cwd = join(__dirname, '..');

  if (isCi) {
    await dockerCompose.down({ cwd });
  }
};
