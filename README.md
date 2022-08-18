# SecTester SDK demo project for Broken Crystals

## Table of contents

- [About this project](#about-this-project)
- [About SecTester](#about-sectester)
- [Setup](#setup)
  - [Fork and clone this repo](#fork-and-clone-this-repo)
  - [Get a Bright API key](#get-a-bright-api-key)
  - [Explore the demo application](#explore-the-demo-application)
  - [A full configuration example](#a-full-configuration-example)
  - [Recommended tests](#recommended-tests)
  - [Example of a CI configuration](#example-of-a-ci-configuration)
- [Documentation & Help](#documentation--help)
- [Contributing](#contributing)
- [License](#license)

## About this project

This is a demo project for the [SecTester JS SDK framework](https://github.com/NeuraLegion/sectester-js), with some installation and usage examples. We recommend forking it and playing around, that’s what it’s for!

## About SecTester

Bright is a developer-first Dynamic Application Security Testing (DAST) scanner.

SecTester is a new tool that integrates our enterprise-grade scan engine directly into your unit tests.

With SecTester you can:

- Test every function and component directly
- Run security scans at the speed of unit tests
- Find vulnerabilities with no false positives, before you finalize your Pull Request

Trying out Bright’s SecTester is _**free**_ 💸, so let’s get started!

> ⚠️ **Disclaimer**
>
> The SecTester project is currently in beta as an early-access tool. We are looking for your feedback to make it the best possible solution for developers, aimed to be used as part of your team’s SDLC. We apologize if not everything will work smoothly from the start, and hope a few bugs or missing features will be no match for you!
>
> Thank you! We appreciate your help and feedback!

## Setup

### Fork and clone this repo

1.  Press the ‘fork’ button to make a copy of this repo in your own GH account
2.  In your forked repo, clone this project down to your local machine using either SSH or HTTP

### Get a Bright API key

1.  Register for a free account at Bright’s [**signup**](https://app.neuralegion.com/signup) page
2.  Optional: Skip the quickstart wizard and go directly to [**User API key creation**](https://app.neuralegion.com/profile)
3.  Create a Bright API key ([**check out our doc on how to create a user key**](https://docs.brightsec.com/docs/manage-your-personal-account#manage-your-personal-api-keys-authentication-tokens))
4.  Save the Bright API key
    1.  We recommend using your Github repository secrets feature to store the key, accessible via the `Settings > Security > Secrets > Actions` configuration. We use the ENV variable called `BRIGHT_TOKEN` in our examples
    2.  If you don’t use that option, make sure you save the key in a secure location. You will need to access it later on in the project but will not be able to view it again.
    3.  More info on [**how to use ENV vars in Github actions**](https://docs.github.com/en/actions/learn-github-actions/environment-variables)

> ⚠️ Make sure your API key is saved in a location where you can retrieve it later! You will need it in these next steps!

### Explore the demo application

Navigate to your local version of this project. Then, in your command line, install the dependencies:

```bash
$ npm ci
```

The whole list of required variables to start the demo application is described in `.env.example` file. The template for this .env file is available in the root folder.

After that, you can easily create a `.env` file from the template by issuing the following command:

```bash
$ cp .env.example .env
```

Once this template is done, copying over (should be instantaneous), navigate to your `.env` file, and paste your Bright API key as the value of the `BRIGHT_TOKEN` variable.

```text
BRIGHT_TOKEN = <your_API_key_here>
```

Finally, you have to build and run services with Docker. Start Docker, and issue the command as follows:

```bash
$ docker compose up -d
```

While having the application running, open a browser and type `http://localhost:3000/swagger`, and hit enter.
You should see the Swagger UI page for that application that allows you to test the RESTFul CRUD API, like in the following screenshot:

![Swagger UI](https://user-images.githubusercontent.com/38690835/184880272-0ec59ac0-e200-454d-ae24-6deba4ec9a2e.png)

To explore the Swagger UI:

- Click on the `POST /api/render` endpoint
- Click on the "Try it out" button
- Click on the blue "Execute" button
- Then you should see a view similar to the following, where you can see the JSON returned from the API:

![Swagger UI](https://user-images.githubusercontent.com/38690835/184880763-e683ccf4-fc75-4b53-a305-4b1c1ba18ba2.png)

Then you can start tests with SecTester against these endpoints as follows (make sure you use a new terminal window, as the original is still running the API for us!)

```bash
$ npm run test:sec
```

> You will find tests written with SecTester in the `./test/sec` folder.

This can take a few minutes, and then you should see the result, like in the following screenshot:

```text
 FAIL  test/sec/render.e2e-spec.ts (143.608 s)
  /api
    POST /render
      ✕ should not contain possibility to server-side code execution (282227 ms)

  ● /api › POST /render › should not contain possibility to server-side code execution

    IssueFound: Target is vulnerable

    Issue in Bright UI:   https://development.playground.neuralegion.com/scans/bH2vd1CfxHtKjLNLxw94oj/issues/w68hhVa1We95UNZx4FmefT
    Name:                 SSTI - Server Side Template Injection
    Severity:             High
    Remediation:
    To protect against this type of attack, you shall sanitize input before passing to template directive and create a safe environment.
    Details:
    SSTI (Server Side Template Injection) is vulnerability that is exploited by malformed user input which allows embedding user input into different application without proper sanitization. The highest possibility of this vulnerability is to create a path for remote code execution capabilities and be exploited by malicious subjects. Identification of this vulnerability is possible with observation of the invalid syntax in the input with an error messages displayed after creating a response.
    References:
     ● https://www.owasp.org/index.php/Server-Side_Includes_(SSI)_Injection
     ● https://www.owasp.org/images/7/7e/Owasp_SSTI_final.pdf

      at SecScan.assert (../packages/runner/src/lib/SecScan.ts:59:13)
          at runMicrotasks (<anonymous>)
      at SecScan.run (../packages/runner/src/lib/SecScan.ts:37:7)
      at Object.<anonymous> (sec/render.e2e-spec.ts:21:7)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        143.677 s
Ran all test suites matching /render.e2e-spec.ts/i.
```

### A full configuration example

Now you will look under the hood to see how this all works. In the following example, we will test the app we just set up for any instances of Server Side Template Injection. [Jest](https://github.com/facebook/jest) is provided as the testing framework, that provides assert functions and test-double utilities that help with mocking, spying, etc.

The [`@sectester/runner`](https://github.com/NeuraLegion/sectester-js/tree/master/packages/runner) package provides a set of utilities that allows scanning the demo application for vulnerabilities. Let's expand the previous example using the built-in `SecRunner` class:

[`test/sec/render.e2e-spec.ts`](./test/sec/render.e2e-spec.ts)

```ts
let runner!: SecRunner;

// ...

beforeEach(async () => {
  runner = new SecRunner({ hostname: 'app.neuralegion.com' });

  await runner.init();
});

afterEach(() => runner.clear());
```

To set up a runner, create a `SecRunner` instance on the top of the file, passing a configuration as follows:

```ts
import { SecRunner } from '@sectester/runner';

const runner = new SecRunner({ hostname: 'app.neuralegion.com' });
```

After that, you have to initialize a `SecRunner` instance:

```ts
await runner.init();
```

The runner is now ready to perform your tests. To start scanning your endpoint, first, you have to create a `SecScan` instance. We do this with `runner.createScan` as shown in the example below.

Now, you will write and run your first unit test!

Let's verify the `POST /api/render` endpoint for SSTI:

```ts
describe('POST /render', () => {
  it('should not contain possibility to server-side code execution', async () => {
    await runner
      .createScan({
        tests: [TestType.SSTI]
      })
      .run({
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'origin': process.env.BROKEN_CRYSTALS_URL!,
          'content-type': 'text/plain'
        },
        body: `Some text`,
        url: `${process.env.BROKEN_CRYSTALS_URL}/api/render`
      });
  });
});
```

This will raise an exception when the test fails, with remediation information and a deeper explanation of SSTI, right in your command line!

Let's look at another test for the `GET /api/spawn` endpoint, this time for OSI.

```ts
describe('GET /spawn', () => {
  it('should not be able to execute shell commands on the host operating system', async () => {
    await runner
      .createScan({
        tests: [TestType.OSI]
      })
      .run({
        method: 'GET',
        url: `${process.env.BROKEN_CRYSTALS_URL}/api/spawn?command=pwd`
      });
  });
});
```

As you can see, writing a new test for OSI follows the same pattern as SSTI.

By default, each found issue will cause the scan to stop. To control this behavior you can set a severity threshold using the `threshold` method. Since SSTI (Server Side Template Injection) is considered to be high severity issue, we can pass `Severity.HIGH` for stricter checks:

```ts
scan.threshold(Severity.HIGH);
```

To avoid long-running test, you can specify a timeout, to say how long to wait before aborting it:

```ts
scan.timeout(300000);
```

To make sure that Jest won't abort tests early, you should align a test timeout with a scan timeout as follows:

```ts
jest.setTimeout(300000);
```

To clarify an attack surface and speed up the test, we suggest making clear where to discover parameters according to the source code.

[`src/app.controller.ts`](https://github.com/NeuraLegion/brokencrystals/blob/master/src/app.controller.ts)

```ts
@Controller('/api')
@ApiTags('App controller')
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Post('render')
  @ApiProduces('text/plain')
  @ApiConsumes('text/plain')
  @ApiOperation({
    description: SWAGGER_DESC_RENDER_REQUEST
  })
  @ApiBody({ description: 'Write your text here' })
  @ApiCreatedResponse({
    description: 'Rendered result'
  })
  async renderTemplate(@Body() raw): Promise<string> {
    if (typeof raw === 'string' || Buffer.isBuffer(raw)) {
      const text = raw.toString().trim();
      const res = dotT.compile(text)();
      this.logger.debug(`Rendered template: ${res}`);
      return res;
    }
  }

  // ...
}
```

For the example above, it should look like this:

```ts
const scan = runner.createScan({
  tests: [TestType.SSTI],
  attackParamLocations: [AttackParamLocation.BODY]
});
```

Finally, the test should look like this:

```ts
it('should not contain possibility to server-side code execution', async () => {
  await runner
    .createScan({
      tests: [TestType.SSTI],
      attackParamLocations: [AttackParamLocation.BODY]
    })
    .timeout(300000)
    .threshold(Severity.HIGH)
    .run({
      method: 'POST',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'origin': process.env.BROKEN_CRYSTALS_URL!,
        'content-type': 'text/plain'
      },
      body: `Some text`,
      url: `${process.env.BROKEN_CRYSTALS_URL}/api/render`
    });
});
```

Here is a completed `test/sec/render.e2e-spec.ts` file with all the tests and configuration set up.

```ts
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, TestType } from '@sectester/scan';

describe('/api', () => {
  const timeout = 300000;
  jest.setTimeout(timeout);
  let runner!: SecRunner;

  beforeEach(() => {
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
            'origin': process.env.BROKEN_CRYSTALS_URL!,
            'content-type': 'text/plain'
          },
          body: `Some text`,
          url: `${process.env.BROKEN_CRYSTALS_URL}/api/render`
        });
    });
  });
});
```

Full documentation can be found in the [`@sectester/runner`](https://github.com/NeuraLegion/sectester-js/tree/master/packages/runner) README.

### Recommended tests

|                                                                                  |                                                                                                                                              |                              |                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test name**                                                                    | **Description**                                                                                                                              | **Usage in SecTester**       | **Detectable vulnerabilities**                                                                                                                                                                                                                                                                                                                                                                                               |
| **Broken JWT Authentication**                                                    | Tests for secure implementation of JSON Web Token (JWT) in the application                                                                   | `jwt`                        | - [Broken JWT Authentication](https://docs.brightsec.com/docs/broken-jwt-authentication)                                                                                                                                                                                                                                                                                                                                     |
| **Broken SAML Authentication**                                                   | Tests for secure implementation of SAML authentication in the application                                                                    | `broken_saml_auth`           | - [Broken SAML Authentication](https://docs.brightsec.com/docs/broken-saml-authentication)                                                                                                                                                                                                                                                                                                                                   |
| **Brute Force Login**                                                            | Tests for availability of commonly used credentials                                                                                          | `brute_force_login`          | - [Brute Force Login](https://docs.brightsec.com/docs/brute-force-login)                                                                                                                                                                                                                                                                                                                                                     |
| **Business Constraint Bypass**                                                   | Tests if the limitation of number of retrievable items via an API call is configured properly                                                | `business_constraint_bypass` | - [Business Constraint Bypass](https://docs.brightsec.com/docs/business-constraint-bypass)                                                                                                                                                                                                                                                                                                                                   |
| **Client-Side XSS** <br>_(DOM Cross-Site Scripting)_                             | Tests if various application DOM parameters are vulnerable to JavaScript injections                                                          | `dom_xss`                    | - [Reflective Cross-site scripting (rXSS)](https://docs.brightsec.com/docs/reflective-cross-site-scripting-rxss)<br> <br> - [Persistent Cross-site scripting (pXSS)](https://docs.brightsec.com/docs/persistent-cross-site-scripting-pxss)                                                                                                                                                                                   |
| **Common Files Exposure**                                                        | Tests if common files that should not be accessible are accessible                                                                           | `common_files`               | - [Exposed Common File](https://docs.brightsec.com/docs/exposed-common-file)                                                                                                                                                                                                                                                                                                                                                 |
| **Cookie Security Check**                                                        | Tests if the application uses and implements cookies with secure attributes                                                                  | `cookie_security`            | - [Sensitive Cookie in HTTPS Session Without Secure Attribute](https://docs.brightsec.com/docs/sensitive-cookie-in-https-session-without-secure-attribute)<br> <br> - [Sensitive Cookie Without HttpOnly Flag](https://docs.brightsec.com/docs/sensitive-cookie-without-httponly-flag)<br> <br>- [Sensitive Cookie Weak Session ID](https://docs.brightsec.com/docs/sensitive-cookie-weak-session-id)                        |
| **Cross-Site Request Forgery (CSRF)**                                            | Tests application forms for vulnerable cross-site filling and submitting                                                                     | `csrf`                       | - [Unauthorized Cross-Site Request Forgery (CSRF)](https://docs.brightsec.com/docs/unauthorized-cross-site-request-forgery-csrf)<br> <br> - [Authorized Cross-Site Request Forgery (CSRF)](https://docs.brightsec.com/docs/authorized-cross-site-request-forgery-csrf)                                                                                                                                                       |
| **Cross-Site Scripting (XSS)**                                                   | Tests if various application parameters are vulnerable to JavaScript injections                                                              | `xss`                        | - [Reflective Cross-Site Scripting (rXSS)](https://docs.brightsec.com/docs/reflective-cross-site-scripting-rxss)<br> <br> - [Persistent Cross-Site Scripting (pXSS)](https://docs.brightsec.com/docs/persistent-cross-site-scripting-pxss)                                                                                                                                                                                   |
| **Default Login Location**                                                       | Tests if login form location in the target application is easy to guess and accessible                                                       | `default_login_location`     | - [Default Login Location](https://docs.brightsec.com/docs/default-login-location)                                                                                                                                                                                                                                                                                                                                           |
| **Directory Listing**                                                            | Tests if server-side directory listing is possible                                                                                           | `directory_listing`          | - [Directory Listing](https://docs.brightsec.com/docs/directory-listing)                                                                                                                                                                                                                                                                                                                                                     |
| **Email Header Injection**                                                       | Tests if it is possible to send emails to other addresses through the target application mailing server, which can lead to spam and phishing | `email_injection`            | - [Email Header Injection](https://docs.brightsec.com/docs/email-header-injection)                                                                                                                                                                                                                                                                                                                                           |
| **Exposed AWS S3 Buckets Details** <br>_(Open Buckets)_                          | Tests if exposed AWS S3 links lead to anonymous read access to the bucket                                                                    | `open_buckets`               | - [Exposed AWS S3 Buckets Details](https://docs.brightsec.com/docs/open-bucket)                                                                                                                                                                                                                                                                                                                                              |
| **Exposed Database Details** <br>_(Open Database)_                               | Tests if exposed database connection strings are open to public connections                                                                  | `open_buckets`               | - [Exposed Database Details](https://docs.brightsec.com/docs/open-database)<br> <br> - [Exposed Database Connection String](https://docs.brightsec.com/docs/exposed-database-connection-string)                                                                                                                                                                                                                              |
| **Full Path Disclosure (FPD)**                                                   | Tests if various application parameters are vulnerable to exposure of errors that include full webroot path                                  | `full_path_disclosure`       | - [Full Path Disclosure](https://docs.brightsec.com/docs/full-path-disclosure)                                                                                                                                                                                                                                                                                                                                               |
| **Headers Security Check**                                                       | Tests for proper Security Headers configuration                                                                                              | `header_security`            | - [Misconfigured Security Headers](https://docs.brightsec.com/docs/misconfigured-security-headers)<br> <br> - [Missing Security Headers](https://docs.brightsec.com/docs/missing-security-headers)<br> <br>- [Insecure Content Secure Policy Configuration](https://docs.brightsec.com/docs/insecure-content-secure-policy-configuration)                                                                                    |
| **HTML Injection**                                                               | Tests if various application parameters are vulnerable to HTML injection                                                                     | `html_injection`             | - [HTML Injection](https://docs.brightsec.com/docs/html-injection)                                                                                                                                                                                                                                                                                                                                                           |
| **Improper Assets Management**                                                   | Tests if older or development versions of API endpoints are exposed and can be used to get unauthorized access to data and privileges        | `improper_asset_management`  | - [Improper Assets Management](https://docs.brightsec.com/docs/improper-assets-management)                                                                                                                                                                                                                                                                                                                                   |
| **Insecure HTTP Method** <br>_(HTTP Method Fuzzer)_                              | Tests enumeration of possible HTTP methods for vulnerabilities                                                                               | `http_method_fuzzing`        | - [Insecure HTTP Method](https://docs.brightsec.com/docs/insecure-http-method)                                                                                                                                                                                                                                                                                                                                               |
| **Insecure TLS Configuration**                                                   | Tests SSL/TLS ciphers and configurations for vulnerabilities                                                                                 | `insecure_tls_configuration` | - [Insecure TLS Configuration](https://docs.brightsec.com/docs/insecure-tls-configuration)                                                                                                                                                                                                                                                                                                                                   |
| **Known JavaScript Vulnerabilities** <br>_(JavaScript Vulnerabilities Scanning)_ | Tests for known JavaScript component vulnerabilities                                                                                         | `retire_js`                  | - [JavaScript Component with Known Vulnerabilities](https://docs.brightsec.com/docs/javascript-component-with-known-vulnerabilities)                                                                                                                                                                                                                                                                                         |
| **Known WordPress Vulnerabilities** <br>_(WordPress Scan)_                       | Tests for known WordPress vulnerabilities and tries to enumerate a list of users                                                             | `wordpress`                  | - [WordPress Component with Known Vulnerabilities](https://docs.brightsec.com/docs/wordpress-component-with-known-vulnerabilities)                                                                                                                                                                                                                                                                                           |
| **LDAP Injection**                                                               | Tests if various application parameters are vulnerable to unauthorized LDAP access                                                           | `ldapi`                      | - [LDAP Injection](https://docs.brightsec.com/docs/ldap-injection)<br> <br> - [LDAP Error](https://docs.brightsec.com/docs/ldap-error)                                                                                                                                                                                                                                                                                       |
| **Local File Inclusion (LFI)**                                                   | Tests if various application parameters are vulnerable to loading of unauthorized local system resources                                     | `lfi`                        | - [Local File Inclusion (LFI)](https://docs.brightsec.com/docs/local-file-inclusion-lfi)                                                                                                                                                                                                                                                                                                                                     |
| **Mass Assignment**                                                              | Tests if it is possible to create requests with additional parameters to gain privilege escalation                                           | `mass_assignment`            | - [Mass Assignment](https://docs.brightsec.com/docs/mass-assignment)                                                                                                                                                                                                                                                                                                                                                         |
| **OS Command Injection**                                                         | Tests if various application parameters are vulnerable to Operation System (OS) commands injection                                           | `osi`                        | - [OS Command Injection](https://docs.brightsec.com/docs/os-command-injection)                                                                                                                                                                                                                                                                                                                                               |
| **Prototype Pollution**                                                          | Tests if it is possible to inject properties into existing JavaScript objects                                                                | `proto_pollution`            | - [Prototype Pollution](https://docs.brightsec.com/docs/prototype-pollution)                                                                                                                                                                                                                                                                                                                                                 |
| **Remote File Inclusion (RFI)**                                                  | Tests if various application parameters are vulnerable to loading of unauthorized remote system resources                                    | `rfi`                        | - [Remote File Inclusion (RFI)](https://docs.brightsec.com/docs/remote-file-inclusion-rfi)                                                                                                                                                                                                                                                                                                                                   |
| **Secret Tokens Leak**                                                           | Tests for exposure of secret API tokens or keys in the target application                                                                    | `secret_tokens`              | - [Secret Tokens Leak](https://docs.brightsec.com/docs/secret-tokens-leak)                                                                                                                                                                                                                                                                                                                                                   |
| **Server Side Template Injection (SSTI)**                                        | Tests if various application parameters are vulnerable to server-side code execution                                                         | `ssti`                       | - [Server Side Template Injection (SSTI)](https://docs.brightsec.com/docs/server-side-template-injection-ssti)                                                                                                                                                                                                                                                                                                               |
| **Server Side Request Forgery (SSRF)**                                           | Tests if various application parameters are vulnerable to internal resources access                                                          | `ssrf`                       | - [Server Side Request Forgery (SSRF)](https://docs.brightsec.com/docs/server-side-request-forgery-ssrf)                                                                                                                                                                                                                                                                                                                     |
| **SQL Injection (SQLI)**                                                         | SQL Injection tests vulnerable parameters for SQL database access                                                                            | `sqli`                       | - [SQL Injection: Blind Boolean Based](https://docs.brightsec.com/docs/sql-injection-blind-boolean-based)<br> <br> - [SQL Injection: Blind Time Based](https://docs.brightsec.com/docs/sql-injection-blind-time-based)<br> <br> - [SQL Injection](https://docs.brightsec.com/docs/sql-injection)<br> <br> - [SQL Database Error Message in Response](https://docs.brightsec.com/docs/sql-database-error-message-in-response) |
| **Unrestricted File Upload**                                                     | Tests if file upload mechanisms are validated properly and denies upload of malicious content                                                | `file_upload`                | - [Unrestricted File Upload](https://docs.brightsec.com/docs/unrestricted-file-upload)                                                                                                                                                                                                                                                                                                                                       |
| **Unsafe Date Range** <br>_(Date Manipulation)_                                  | Tests if date ranges are set and validated properly                                                                                          | `date_manipulation`          | - [Unsafe Date Range](https://docs.brightsec.com/docs/unsafe-date-range)                                                                                                                                                                                                                                                                                                                                                     |
| **Unsafe Redirect** <br>_(Unvalidated Redirect)_                                 | Tests if various application parameters are vulnerable to injection of a malicious link which can redirect a user without validation         | `unvalidated_redirect`       | - [Unsafe Redirect](https://docs.brightsec.com/docs/unsafe-redirect)                                                                                                                                                                                                                                                                                                                                                         |
| **User ID Enumeration**                                                          | Tests if it is possible to collect valid user ID data by interacting with the target application                                             | `id_enumeration`             | - [Enumerable Integer-Based ID](https://docs.brightsec.com/docs/enumerable-integer-based-id)                                                                                                                                                                                                                                                                                                                                 |
| **Version Control System Data Leak**                                             | Tests if it is possible to access Version Control System (VCS) resources                                                                     | `version_control_systems`    | - [Version Control System Data Leak](https://docs.brightsec.com/docs/version-control-system-data-leak)                                                                                                                                                                                                                                                                                                                       |
| **XML External Entity Injection**                                                | Tests if various XML parameters are vulnerable to XML parsing of unauthorized external entities                                              | `xxe`                        | - [XML External Entity Injection](https://docs.brightsec.com/docs/xml-external-entity-injection)                                                                                                                                                                                                                                                                                                                             |

### Example of a CI configuration

You can integrate this library into any CI you use, for that you will need to add the `BRIGHT_TOKEN` ENV vars to your CI. Then add the following to your `github actions` configuration:

```yaml
steps:
  - name: Run sec tests
    run: npm run test:sec
    env:
      POSTGRES_USER: ${{ secrets.POSTGRES_PASSWORD }}
      POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
      KEYCLOAK_DB_USER: ${{ secrets.KEYCLOAK_DB_USER }}
      KEYCLOAK_DB_PASSWORD: ${{ secrets.KEYCLOAK_DB_PASSWORD }}
      KEYCLOAK_USER: ${{ secrets.KEYCLOAK_USER }}
      KEYCLOAK_PASSWORD: ${{ secrets.KEYCLOAK_PASSWORD }}
      BRIGHT_TOKEN: ${{ secrets.BRIGHT_TOKEN }}
      BRIGHT_HOSTNAME: app.neuralegion.com
      BROKEN_CRYSTALS_URL: http://localhost:3000
```

For a full list of CI configuration examples, check out the docs below.

## Documentation & Help

- Full documentation available at: [https://docs.brightsec.com/](https://docs.brightsec.com/)
- Join our [Discord channel](https://discord.gg/jy9BB7twtG) and ask anything!

## Contributing

Please read [contributing guidelines here](./CONTRIBUTING.md).

<a href="https://github.com/NeuraLegion/sectester-js-demo-broken-crystals/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NeuraLegion/sectester-js-demo-broken-crystals"/>
</a>

## License

Copyright © 2022 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](LICENSE) for details.
