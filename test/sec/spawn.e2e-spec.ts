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

  describe('GET /spawn', () => {
    it('should not be able to execute shell commands on the host operating system', async () => {
      await runner
        .createScan({
          tests: [TestType.OSI],
          name: expect.getState().currentTestName,
          attackParamLocations: [AttackParamLocation.QUERY]
        })
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/spawn?command=pwd`
        });
    });
  });
});
