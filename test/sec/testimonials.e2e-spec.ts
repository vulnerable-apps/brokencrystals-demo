import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, TestType } from '@sectester/scan';

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

  describe('GET /testimonials/count', () => {
    it('should not execute commands for SQL database', async () => {
      await runner
        .createScan({
          tests: [TestType.SQLI],
          name: expect.getState().currentTestName,
          attackParamLocations: [AttackParamLocation.QUERY]
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/testimonials/count?query=lorem`
        });
    });
  });
});
