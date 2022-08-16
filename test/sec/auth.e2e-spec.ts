import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, TestType } from '@sectester/scan';
import axios from 'axios';

const generateToken = async (jwtType: string) => {
  const { headers } = await axios.post(
    `${process.env.BROKEN_CRYSTALS_URL}/api/auth/jwt/${jwtType}/login`,
    {
      user: 'admin',
      password: 'admin',
      op: 'basic'
    }
  );

  return headers.authorization;
};

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

  describe('GET /auth/jwt/{jwtType}/validate', () => {
    it.each(['kid-sql', 'jwk', 'jku', 'weak-key', 'x5c', 'x5u'])(
      'should contain secure implementation of JSON Web Token (%s)',
      async jwtType => {
        const token = await generateToken(jwtType);

        return runner
          .createScan({
            tests: [TestType.JWT],
            name: expect.getState().currentTestName,
            attackParamLocations: [AttackParamLocation.HEADER]
          })
          .timeout(timeout)
          .run({
            method: 'GET',
            headers: { authorization: token },
            url: `${process.env.BROKEN_CRYSTALS_URL}/api/auth/jwt/${jwtType}/validate`
          });
      }
    );
  });
});
