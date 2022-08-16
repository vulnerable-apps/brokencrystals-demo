import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';

describe('/api', () => {
  const timeout = 300000;
  jest.setTimeout(timeout);
  let runner!: SecRunner;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME! });

    return runner.init();
  });

  afterEach(() => runner.clear());

  describe('GET /config', () => {
    it('should use and implement cookies with secure attributes', async () => {
      await runner
        .createScan({
          tests: [TestType.COOKIE_SECURITY],
          name: expect.getState().currentTestName
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/config`
        });
    });

    it('should contain proper security headers configuration', async () => {
      await runner
        .createScan({
          tests: [TestType.HEADER_SECURITY],
          name: expect.getState().currentTestName
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/config?query=no-sec-headers`
        });
    });

    it('should not contain errors that include full webroot path', async () => {
      await runner
        .createScan({
          tests: [TestType.FULL_PATH_DISCLOSURE],
          name: expect.getState().currentTestName
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          headers: {
            cookie: `bc-calls-counter=${Date.now().toString()}`
          },
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/config`
        });
    });
  });
});
