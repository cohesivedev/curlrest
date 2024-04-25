# curlrest

cURL as a REST API running on NodeJS.

## Examples

Please see the `examples.js` file, change the code to toggle between the different calls.

## Why do it

Edge-compute environments (i.e. Cloudflare Workers, Lambda@Edge) cannot fully run everything we want like CLI-based tooling such as `curl`. Using curl as a REST API bypasses these limitations with a $6/month VPS. We usually want to do this for better tool interop: Chrome DevTools can copy network requests as cURL strings so using that should be nearly as easy as running it in CLI.

This is a priviledged service and isn't intended to be open for public use. We safeguard the running environment against basic human mistakes that happen occasionally. All authenticated users have the capacity to spawn `curl` processes and affect the filesystem

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
- `sqlite3` db for batched request storage
- TODO: TOTP as alternate authentication method

## Support

Are you thinking about using this commercially? If you would like dedicated technical support please contact the [cohesive.dev team](mailto:hi@cohesive.dev).