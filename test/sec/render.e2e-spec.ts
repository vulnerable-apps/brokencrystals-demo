import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, Severity, TestType } from '@sectester/scan';

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

  describe('POST /render', () => {
    it('should not contain possibility to server-side code execution', async () => {
      await runner
        .createScan({
          tests: [TestType.SSTI],
          name: expect.getState().currentTestName,
          attackParamLocations: [AttackParamLocation.BODY]
        })
        .timeout(timeout)
        .threshold(Severity.HIGH)
        .run({
          method: 'POST',
          headers: {
            'accept': 'application/json, text/plain, */*',
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            'origin': process.env.BROKEN_CRYSTALS_URL!,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'content-type': 'text/plain'
          },
          body: `Some text`,
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/render`
        });
    });
  });
});
