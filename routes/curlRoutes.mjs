import util from 'util';
import { execFile as execFileNonPromise } from 'child_process';
const execFile = util.promisify(execFileNonPromise);

const DEFAULTS = {
    proxy: {
        host: null,
        username: null,
        password: null,
    },
    verbose: false,
    followRedirect: true,
    headers: {},
    method: 'get',
    url: null,
    curlPath: '/usr/bin/curl'
};

async function runCurl(options = DEFAULTS) {

    let { url, method, headers, body, curlPath, verbose, followRedirect } = options;
    const { username, password, host } = options.proxy;

    const headerArgs = Object.entries(headers).map(([key, value]) => `-H '${key}: ${value}'`);

    body = body || '';
    if (body) {
        body = `--data-raw '${body}'`;
    }

    curlPath = curlPath || DEFAULTS.curlPath;

    const args = [
        `-X '${method}'`,
        `-U '${username}:${password}'`,
        `-x '${host}'`,
        verbose ? '-v' : '',
        followRedirect ? '-L' : '',
        ...headerArgs,
        body,
        `'${url}'`
    ];


    // Use a rotating proxy instead!
    try {
        const { stdout, stderr } = await execFile(curlPath, args, { shell: "/bin/sh" });
        console.log(stderr);
        return { stderr, stdout };
    } catch (e) {
        const { stdout, stderr } = e;
        console.log(stderr);
        return { stderr, stdout };
    }
}

function addTo(app) {
    app.post('/curlSync', async c => {
        const options = await c.req.json();
        return c.json(await runCurl(options));
    });
}

export default {
    addTo,
};