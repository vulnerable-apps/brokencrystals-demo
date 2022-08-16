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

  describe('POST /metadata', () => {
    it('should not contain forms liable vulnerable cross-site filling and submitting', async () => {
      await runner
        .createScan({
          tests: [TestType.CSRF],
          name: expect.getState().currentTestName,
          attackParamLocations: [AttackParamLocation.QUERY]
        })
        .timeout(timeout)
        .run({
          method: 'POST',
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/metadata`,
          query: {
            xml: '%3C%3Fxml+version%3D%221.0%22+encoding%3D%22UTF-8%22%3F%3E%3C%21DOCTYPE+child+%5B+%3C%21ENTITY+child+SYSTEM+%22file%3A%2F%2F%2Fetc%2Fpasswd%22%3E+%5D%3E%3Cchild%3E%3C%2Fchild%3E'
          }
        });
    });
  });
});
