# curlrest

cURL as a REST API running on NodeJS.

## Examples

### Use with a proxy service

Run the app from the CLI with basic auth setup:
```bash
USERNAME=hello PASSWORD=world node index.mjs
```

Client side code:
```js
const username = 'hello';
const password = 'world';

const res = await fetch('http://localhost:3001/curlSync', {
    headers: {
        'content-type': 'application/json',
        'authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
    },
    method: 'post',
    body: JSON.stringify({
        proxy: {
            host: 'pr.oxylabs.io:7777',
            username: 'oxylabsPROXYu5ername',
            password: 'oxylabsPROXYp4ssword',
        },
        followRedirect: true,
        verbose: true,
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        },
        url: 'https://ip.oxylabs.io',
    })
}).then(res => res.json());

// See the response body
console.log(res.stdout);

// See the response headers
console.log(res.stderr);
```

## Why do it

Edge-compute environments (i.e. Cloudflare Workers, Lambda@Edge) cannot fully run everything we want like CLI-based tooling such as `curl`. Using curl as a REST API bypasses these limitations with a $6/month VPS. We usually want to do this for better tool interop: Chrome DevTools can copy network requests as cURL strings so using that should be nearly as easy as running it in CLI.

### Use cases

- Fetch via proxy service (Oxylabs, Smartproxy, Apify, etc.)
    - Web Fetch API does not support showing HTTP headers, graceful handling of redirects, etc.
- Act as a simple VPS proxy
- Fire and forget batch fetch service

## What it does

- Execute `curl` synchronously and safely
- TODO: Execute batched curl calls asynchronously with a callback and a request id for each item in the batch

## Prerequisites

- USERNAME and PASSWORD env variables passed to the process for basic auth
- TODO: `sqlite3` db for batched request storage
- TODO: TOTP as alternate authentication method

## Support

Are you thinking about using this commercially? If you would like dedicated technical support please contact the [cohesive.dev team](mailto:hi@cohesive.dev).