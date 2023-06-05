# SecTester SDK demo project for Broken Crystals

## Table of contents

- [About this project](#about-this-project)
- [About SecTester](#about-sectester)
- [Initial setup](#initial-setup)
  - [Fork this repo](#fork-this-repo)
  - [Get a Bright API key](#get-a-bright-api-key)
- [Running in a CI pipeline](#running-in-a-ci-pipeline)
  - [GitHub Actions setup](#github-actions-setup)
  - [Using with GitHub Actions](#using-with-github-actions)
- [Running on a local machine](#running-on-a-local-machine)
  - [Local setup](#local-setup)
  - [Explore the demo application](#explore-the-demo-application)
  - [Run tests locally on the demo application](#run-tests-locally-on-the-demo-application)
- [A full configuration example](#a-full-configuration-example)
- [Recommended tests](#recommended-tests)
- [Documentation & Help](#documentation--help)
- [Contributing](#contributing)
- [License](#license)

## About this project

This is a demo project for the [SecTester JS SDK framework](https://github.com/NeuraLegion/sectester-js), with some installation and usage examples. We recommend forking it and playing around, that’s what it’s for!

## About SecTester

Bright is a developer-first Dynamic Application Security Testing (DAST) platform.

SecTester is a new open-source tool that integrates our enterprise-grade scan engine directly into your unit tests, integration tests, e2e tests or whichever automated tests you use.

With SecTester you can:

- Test every function and component directly with our DAST engine
- Run security scans at the speed of unit tests
- Find vulnerabilities with no false positives, before you finalize your pull request

Trying out Bright’s SecTester is _**free**_ 💸, so let’s get started!

> ⚠️ **Disclaimer**
>
> The SecTester project is currently in beta as an early-access tool. We are looking for your feedback to make it the best possible solution for developers, aimed to be used as part of your team’s SDLC. We apologize if not everything will work smoothly from the start, but we are constantly improving!
>
> Thank you! We appreciate your help and feedback!

## Initial setup

### Fork this repo

1.  Press the ‘fork’ button to make a copy of this repo in your own GitHub account

### Get a Bright API key

1.  Register for a free account at Bright’s [**signup**](https://app.neuralegion.com/signup) page
2.  Skip the quickstart wizard and go directly to [**User API key creation**](https://app.neuralegion.com/profile)
3.  Create a Bright API key ([**check out our docs on how to create a user key**](https://docs.brightsec.com/docs/manage-your-personal-account#manage-your-personal-api-keys-authentication-tokens))
4.  Save the Bright API key
    1.  For this demo, we recommend using your Github repository secrets feature to store the key, accessible via the `Settings > Security > Secrets > Actions` configuration. We use the ENV variable called `BRIGHT_TOKEN` in our examples
    2.  If you don’t use that option, make sure you save the key in a secure location. You will need to access it later on in the project but will not be able to view it again.
    3.  More info on [**how to use ENV vars in Github actions**](https://docs.github.com/en/actions/learn-github-actions/environment-variables)

> ⚠️ Make sure your API key is saved in a location where you can retrieve it later! You will need it in these next steps!

## Running in a CI pipeline

Once you create your own unit tests using [SecTester](https://github.com/NeuraLegion/sectester-js), you can run it in any CI you choose. To simplify things in this demo we provide an example using the GitHub Actions CI.

### GitHub Actions setup

1.  After forking the main repo, you will need to go to the `Actions` tab and click on the `I understand my workflows, go ahead an enable them` button. This will enable you to run the pre-configured CI example from this demo
2.  Next, add your `BRIGHT_TOKEN` to the GitHub Actions environment variables via the [Secret Variables](https://docs.github.com/en/actions/reference/encrypted-secrets), accessible via the `Settings > Security > Secrets > Actions` configuration. Please make sure that the ENV variable is called `BRIGHT_TOKEN`, as that is what we use in our example

> You can integrate [SecTester](https://github.com/NeuraLegion/sectester-js) into any CI you use. For that, you will need to add the `BRIGHT_TOKEN` ENV vars to your CI.

### Using with GitHub Actions

The following is a minimal configuration for starting [SecTester](https://github.com/NeuraLegion/sectester-js), which is running on the latest LTS version of Node and triggers only when a pull request is opened.

As you can see, the workflow creates a test [job](https://docs.github.com/en/actions/using-jobs/using-jobs-in-a-workflow) that runs SecTester only after all dependencies are installed:

[`.github/workflows/auto-test.yml`](.github/workflows/auto-test.yml)

```yaml
name: CI / Automated testing

on:
  pull_request:
    branches:
      - '**'

jobs:
  test:
    name: Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'
          cache: npm

      - name: Install deps in quiet mode
        run: npm ci -q

      - name: Run SecTester
        run: npm run test:sec
        env:
          BRIGHT_TOKEN: ${{ secrets.BRIGHT_TOKEN }}
          BRIGHT_HOSTNAME: app.neuralegion.com
          BROKEN_CRYSTALS_URL: http://localhost:3000
```

The whole list of environment variables to start the demo application is described in `.env.example` file. However, you can start with the minimal three VARs, as shown in the example above, ignoring others.

In the example above, the CI flow is set to run all the SecTester tests, but if we would like to run a single test we can update the workflow by specifying a regex pattern that matches a test name, as follows:

```yaml
- name: Run SecTester
  run: npm run test:sec -- -t 'testimonials'
  env:
    BRIGHT_TOKEN: ${{ secrets.BRIGHT_TOKEN }}
    BRIGHT_HOSTNAME: app.neuralegion.com
    BROKEN_CRYSTALS_URL: http://localhost:3000
```

Furthermore, to trigger SecTester on demand, you can use [Manual Triggers](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/) for GitHub Actions as follows:

```yaml
name: CI / Automated testing

on:
  workflow_dispatch:
```

You will then see a `Run workflow` button on the Actions tab, enabling you to easily trigger a run.

You can also use the [repository_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch) event to have control on when to start a workflow by making an HTTP request:

```yaml
name: CI / Automated testing

on:
  repository_dispatch:
    types: [sectester]
```

To trigger a workflow, issue the following command using a [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token):

```bash
$ curl -H "Accept: application/vnd.github.everest-preview+json" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/repos/[org-name-or-username]/[repository]/dispatches \
  -d '{ "event_type": "sectester" }'
```

Finally, you may find useful to trigger a workflow at a scheduled time using the [schedule](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) event.

This example triggers the workflow every Sunday at 03:30 UTC:

```yaml
name: CI / Automated testing

on:
  schedule:
    - cron: '30 3 * * sun'
```

> `*` is a special character in YAML, so you have to quote this string

Once the CI runs and a SecTester test fails, this means a vulnerability was found and the output will look as follows:

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

## Running on a local machine

Alternatively to running the tests in the CI, you can run the tests locally on your machine, this is helpful for example if you want to run the tests while you’re working on your code and not consume CI resources.

### Local setup

To begin, clone your forked repo of this project onto your local machine.

To do that, navigate to **your local folder of choice** and clone the project using either SSH or HTTP, for example using the following command:

```bash
$ git clone git@github.com:my-github-handle/sectester-js-demo-broken-crystals.git
```

In the same local folder, using your command line, install the dependencies:

```bash
$ npm ci
```

The whole list of required variables to start the demo application is described in `.env.example` file. The template for this .env file is available in the root folder.

You can easily create a `.env` file from the template by issuing the following command:

```bash
$ cp .env.example .env
```

Once this template is done copying over (should be instantaneous), navigate to your `.env` file, and paste your Bright API key as the value of the `BRIGHT_TOKEN` variable.

```text
BRIGHT_TOKEN = <your_API_key_here>
```

### Explore the demo application

Once the initial setup is complete, you have to build and run services with Docker. Start Docker, and issue the command as follows:

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

### Run tests locally on the demo application

You can start tests with SecTester against these endpoints as follows (make sure you use a new terminal window, as the original is still running the API for us!)

```bash
$ npm run test:sec
```

> You will find tests written with SecTester in the `./test/sec` folder.

This can take a few minutes while the Bright engine spins up. After a moment, you should see the result:

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

## A full configuration example

Let’s look under the hood to see how this all works. In the following example, we will test the app we just set up for any instances of Server Side Template Injection. [Jest](https://github.com/facebook/jest) is provided as the testing framework, that provides assert functions and test-double utilities that help with mocking, spying, etc.

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

Let's verify the `POST /api/render` endpoint for SSTI (read more in [our docs](https://docs.brightsec.com/docs/server-side-template-injection-ssti)):

```ts
describe('POST /render', () => {
  it('should not contain possibility to server-side code execution', async () => {
    await runner
      .createScan({
        tests: [TestType.SSTI]
      })
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
```

This will raise an exception when the test fails, with remediation information and a deeper explanation of SSTI, right in your command line!

Let's look at another test for the `GET /api/spawn` endpoint, this time for OSI (read more in [our docs](https://docs.brightsec.com/docs/os-command-injection)).

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

To clarify an attack surface and speed up the test, we suggest making clear where to discover the parameters according to the source code.

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

## Recommended tests

|                                                                                  |                                                                                                                                              |                              |                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test name**                                                                    | **Description**                                                                                                                              | **Usage in SecTester**       | **Detectable vulnerabilities**                                                                                                                                                                                                                                                                                                                                                                                               |
| **Amazon S3 Bucket Takeover**                                                    | Tests for S3 buckets that no longer exist to prevent data breaches and malware distribution                                                  | `amazon_s3_takeover`         | - [Amazon S3 Bucket Takeover](https://docs.brightsec.com/docs/amazon-s3-bucket-take-over)                                                                                                                                                                                                                                                                                                                                    |
| **Broken JWT Authentication**                                                    | Tests for secure implementation of JSON Web Token (JWT) in the application                                                                   | `jwt`                        | - [Broken JWT Authentication](https://docs.brightsec.com/docs/broken-jwt-authentication)                                                                                                                                                                                                                                                                                                                                     |
| **Broken SAML Authentication**                                                   | Tests for secure implementation of SAML authentication in the application                                                                    | `broken_saml_auth`           | - [Broken SAML Authentication](https://docs.brightsec.com/docs/broken-saml-authentication)                                                                                                                                                                                                                                                                                                                                   |
| **Brute Force Login**                                                            | Tests for availability of commonly used credentials                                                                                          | `brute_force_login`          | - [Brute Force Login](https://docs.brightsec.com/docs/brute-force-login)                                                                                                                                                                                                                                                                                                                                                     |
| **Business Constraint Bypass**                                                   | Tests if the limitation of number of retrievable items via an API call is configured properly                                                | `business_constraint_bypass` | - [Business Constraint Bypass](https://docs.brightsec.com/docs/business-constraint-bypass)                                                                                                                                                                                                                                                                                                                                   |
| **Client-Side XSS** <br>_(DOM Cross-Site Scripting)_                             | Tests if various application DOM parameters are vulnerable to JavaScript injections                                                          | `dom_xss`                    | - [Reflective Cross-site scripting (rXSS)](https://docs.brightsec.com/docs/reflective-cross-site-scripting-rxss)<br> <br> - [Persistent Cross-site scripting (pXSS)](https://docs.brightsec.com/docs/persistent-cross-site-scripting-pxss)                                                                                                                                                                                   |
| **Common Files Exposure**                                                        | Tests if common files that should not be accessible are accessible                                                                           | `common_files`               | - [Exposed Common File](https://docs.brightsec.com/docs/exposed-common-file)                                                                                                                                                                                                                                                                                                                                                 |
| **Cookie Security Check**                                                        | Tests if the application uses and implements cookies with secure attributes                                                                  | `cookie_security`            | - [Sensitive Cookie in HTTPS Session Without Secure Attribute](https://docs.brightsec.com/docs/sensitive-cookie-in-https-session-without-secure-attribute)<br> <br> - [Sensitive Cookie Without HttpOnly Flag](https://docs.brightsec.com/docs/sensitive-cookie-without-httponly-flag)<br> <br>- [Sensitive Cookie Weak Session ID](https://docs.brightsec.com/docs/sensitive-cookie-weak-session-id)                        |
| **Cross-Site Request Forgery** _(CSRF)_                                          | Tests application forms for vulnerable cross-site filling and submitting                                                                     | `csrf`                       | - [Unauthorized Cross-Site Request Forgery (CSRF)](https://docs.brightsec.com/docs/unauthorized-cross-site-request-forgery-csrf)<br> <br> - [Authorized Cross-Site Request Forgery (CSRF)](https://docs.brightsec.com/docs/authorized-cross-site-request-forgery-csrf)                                                                                                                                                       |
| **Cross-Site Scripting** _(XSS)_                                                 | Tests if various application parameters are vulnerable to JavaScript injections                                                              | `xss`                        | - [Reflective Cross-Site Scripting (rXSS)](https://docs.brightsec.com/docs/reflective-cross-site-scripting-rxss)<br> <br> - [Persistent Cross-Site Scripting (pXSS)](https://docs.brightsec.com/docs/persistent-cross-site-scripting-pxss)                                                                                                                                                                                   |
| **Common Vulnerability Exposure** _(CVEs)_                                       | Tests for known third-party common vulnerability exposures                                                                                   | `cve_test`                   | - [Common Vulnerability Exposure](https://docs.brightsec.com/docs/cves)                                                                                                                                                                                                                                                                                                                                                      |
| **Default Login Location**                                                       | Tests if login form location in the target application is easy to guess and accessible                                                       | `default_login_location`     | - [Default Login Location](https://docs.brightsec.com/docs/default-login-location)                                                                                                                                                                                                                                                                                                                                           |
| **Directory Listing**                                                            | Tests if server-side directory listing is possible                                                                                           | `directory_listing`          | - [Directory Listing](https://docs.brightsec.com/docs/directory-listing)                                                                                                                                                                                                                                                                                                                                                     |
| **Email Header Injection**                                                       | Tests if it is possible to send emails to other addresses through the target application mailing server, which can lead to spam and phishing | `email_injection`            | - [Email Header Injection](https://docs.brightsec.com/docs/email-header-injection)                                                                                                                                                                                                                                                                                                                                           |
| **Exposed AWS S3 Buckets Details** <br>_(Open Buckets)_                          | Tests if exposed AWS S3 links lead to anonymous read access to the bucket                                                                    | `open_buckets`               | - [Exposed AWS S3 Buckets Details](https://docs.brightsec.com/docs/open-bucket)                                                                                                                                                                                                                                                                                                                                              |
| **Exposed Database Details** <br>_(Open Database)_                               | Tests if exposed database connection strings are open to public connections                                                                  | `open_buckets`               | - [Exposed Database Details](https://docs.brightsec.com/docs/open-database)<br> <br> - [Exposed Database Connection String](https://docs.brightsec.com/docs/exposed-database-connection-string)                                                                                                                                                                                                                              |
| **Full Path Disclosure** _(FPD)_                                                 | Tests if various application parameters are vulnerable to exposure of errors that include full webroot path                                  | `full_path_disclosure`       | - [Full Path Disclosure](https://docs.brightsec.com/docs/full-path-disclosure)                                                                                                                                                                                                                                                                                                                                               |
| **Headers Security Check**                                                       | Tests for proper Security Headers configuration                                                                                              | `header_security`            | - [Misconfigured Security Headers](https://docs.brightsec.com/docs/misconfigured-security-headers)<br> <br> - [Missing Security Headers](https://docs.brightsec.com/docs/missing-security-headers)<br> <br>- [Insecure Content Secure Policy Configuration](https://docs.brightsec.com/docs/insecure-content-secure-policy-configuration)                                                                                    |
| **HTML Injection**                                                               | Tests if various application parameters are vulnerable to HTML injection                                                                     | `html_injection`             | - [HTML Injection](https://docs.brightsec.com/docs/html-injection)                                                                                                                                                                                                                                                                                                                                                           |
| **Improper Assets Management**                                                   | Tests if older or development versions of API endpoints are exposed and can be used to get unauthorized access to data and privileges        | `improper_asset_management`  | - [Improper Assets Management](https://docs.brightsec.com/docs/improper-assets-management)                                                                                                                                                                                                                                                                                                                                   |
| **Insecure HTTP Method** <br>_(HTTP Method Fuzzer)_                              | Tests enumeration of possible HTTP methods for vulnerabilities                                                                               | `http_method_fuzzing`        | - [Insecure HTTP Method](https://docs.brightsec.com/docs/insecure-http-method)                                                                                                                                                                                                                                                                                                                                               |
| **Insecure TLS Configuration**                                                   | Tests SSL/TLS ciphers and configurations for vulnerabilities                                                                                 | `insecure_tls_configuration` | - [Insecure TLS Configuration](https://docs.brightsec.com/docs/insecure-tls-configuration)                                                                                                                                                                                                                                                                                                                                   |
| **Known JavaScript Vulnerabilities** <br>_(JavaScript Vulnerabilities Scanning)_ | Tests for known JavaScript component vulnerabilities                                                                                         | `retire_js`                  | - [JavaScript Component with Known Vulnerabilities](https://docs.brightsec.com/docs/javascript-component-with-known-vulnerabilities)                                                                                                                                                                                                                                                                                         |
| **Known WordPress Vulnerabilities** <br>_(WordPress Scan)_                       | Tests for known WordPress vulnerabilities and tries to enumerate a list of users                                                             | `wordpress`                  | - [WordPress Component with Known Vulnerabilities](https://docs.brightsec.com/docs/wordpress-component-with-known-vulnerabilities)                                                                                                                                                                                                                                                                                           |
| **LDAP Injection**                                                               | Tests if various application parameters are vulnerable to unauthorized LDAP access                                                           | `ldapi`                      | - [LDAP Injection](https://docs.brightsec.com/docs/ldap-injection)<br> <br> - [LDAP Error](https://docs.brightsec.com/docs/ldap-error)                                                                                                                                                                                                                                                                                       |
| **Local File Inclusion** _(LFI)_                                                 | Tests if various application parameters are vulnerable to loading of unauthorized local system resources                                     | `lfi`                        | - [Local File Inclusion (LFI)](https://docs.brightsec.com/docs/local-file-inclusion-lfi)                                                                                                                                                                                                                                                                                                                                     |
| **Mass Assignment**                                                              | Tests if it is possible to create requests with additional parameters to gain privilege escalation                                           | `mass_assignment`            | - [Mass Assignment](https://docs.brightsec.com/docs/mass-assignment)                                                                                                                                                                                                                                                                                                                                                         |
| **OS Command Injection**                                                         | Tests if various application parameters are vulnerable to Operation System (OS) commands injection                                           | `osi`                        | - [OS Command Injection](https://docs.brightsec.com/docs/os-command-injection)                                                                                                                                                                                                                                                                                                                                               |
| **Prototype Pollution**                                                          | Tests if it is possible to inject properties into existing JavaScript objects                                                                | `proto_pollution`            | - [Prototype Pollution](https://docs.brightsec.com/docs/prototype-pollution)                                                                                                                                                                                                                                                                                                                                                 |
| **Remote File Inclusion** _(RFI)_                                                | Tests if various application parameters are vulnerable to loading of unauthorized remote system resources                                    | `rfi`                        | - [Remote File Inclusion (RFI)](https://docs.brightsec.com/docs/remote-file-inclusion-rfi)                                                                                                                                                                                                                                                                                                                                   |
| **Secret Tokens Leak**                                                           | Tests for exposure of secret API tokens or keys in the target application                                                                    | `secret_tokens`              | - [Secret Tokens Leak](https://docs.brightsec.com/docs/secret-tokens-leak)                                                                                                                                                                                                                                                                                                                                                   |
| **Server Side Template Injection** _(SSTI)_                                      | Tests if various application parameters are vulnerable to server-side code execution                                                         | `ssti`                       | - [Server Side Template Injection (SSTI)](https://docs.brightsec.com/docs/server-side-template-injection-ssti)                                                                                                                                                                                                                                                                                                               |
| **Server Side Request Forgery** _(SSRF)_                                         | Tests if various application parameters are vulnerable to internal resources access                                                          | `ssrf`                       | - [Server Side Request Forgery (SSRF)](https://docs.brightsec.com/docs/server-side-request-forgery-ssrf)                                                                                                                                                                                                                                                                                                                     |
| **SQL Injection** _(SQLI)_                                                       | SQL Injection tests vulnerable parameters for SQL database access                                                                            | `sqli`                       | - [SQL Injection: Blind Boolean Based](https://docs.brightsec.com/docs/sql-injection-blind-boolean-based)<br> <br> - [SQL Injection: Blind Time Based](https://docs.brightsec.com/docs/sql-injection-blind-time-based)<br> <br> - [SQL Injection](https://docs.brightsec.com/docs/sql-injection)<br> <br> - [SQL Database Error Message in Response](https://docs.brightsec.com/docs/sql-database-error-message-in-response) |
| **Unrestricted File Upload**                                                     | Tests if file upload mechanisms are validated properly and denies upload of malicious content                                                | `file_upload`                | - [Unrestricted File Upload](https://docs.brightsec.com/docs/unrestricted-file-upload)                                                                                                                                                                                                                                                                                                                                       |
| **Unsafe Date Range** <br>_(Date Manipulation)_                                  | Tests if date ranges are set and validated properly                                                                                          | `date_manipulation`          | - [Unsafe Date Range](https://docs.brightsec.com/docs/unsafe-date-range)                                                                                                                                                                                                                                                                                                                                                     |
| **Unsafe Redirect** <br>_(Unvalidated Redirect)_                                 | Tests if various application parameters are vulnerable to injection of a malicious link which can redirect a user without validation         | `unvalidated_redirect`       | - [Unsafe Redirect](https://docs.brightsec.com/docs/unsafe-redirect)                                                                                                                                                                                                                                                                                                                                                         |
| **User ID Enumeration**                                                          | Tests if it is possible to collect valid user ID data by interacting with the target application                                             | `id_enumeration`             | - [Enumerable Integer-Based ID](https://docs.brightsec.com/docs/enumerable-integer-based-id)                                                                                                                                                                                                                                                                                                                                 |
| **Version Control System Data Leak**                                             | Tests if it is possible to access Version Control System (VCS) resources                                                                     | `version_control_systems`    | - [Version Control System Data Leak](https://docs.brightsec.com/docs/version-control-system-data-leak)                                                                                                                                                                                                                                                                                                                       |
| **XML External Entity Injection**                                                | Tests if various XML parameters are vulnerable to XML parsing of unauthorized external entities                                              | `xxe`                        | - [XML External Entity Injection](https://docs.brightsec.com/docs/xml-external-entity-injection)                                                                                                                                                                                                                                                                                                                             |

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
