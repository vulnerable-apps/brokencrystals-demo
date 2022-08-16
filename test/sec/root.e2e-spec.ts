import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';

describe('/', () => {
  const timeout = 300000;
  jest.setTimeout(timeout);
  let runner!: SecRunner;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME! });

    return runner.init();
  });

  afterEach(() => runner.clear());

  describe('GET /', () => {
    it('should not access common files', async () => {
      await runner
        .createScan({
          tests: [TestType.COMMON_FILES],
          name: expect.getState().currentTestName
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${process.env.BROKEN_CRYSTALS_URL}`
        });
    });

    it('should contain proper SSL/TLS ciphers and configurations', async () => {
      await runner
        .createScan({
          tests: [TestType.INSECURE_TLS_CONFIGURATION],
          name: expect.getState().currentTestName
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${process.env.BROKEN_CRYSTALS_URL}`
        });
    });
  });
});
