import { v4 as uuidv4 } from 'uuid';
import util from 'util';
import { execFile as execFileNonPromise } from 'child_process';
const execFile = util.promisify(execFileNonPromise);
import db from '../db.mjs';

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
};

const { CURL_PATH = '/usr/bin/curl' } = process.env;

async function runCurl(options = DEFAULTS) {

    let { url, method, headers, body, verbose, followRedirect, proxy } = options;

    const headerArgs = Object.entries(headers).map(([key, value]) => `-H '${key}: ${value}'`);

    body = body || '';
    if (body) {
        body = `--data-raw '${body}'`;
    }

    const args = [
        `-X '${method}'`,
        proxy ? `-U '${proxy.username}:${proxy.password}'` : '',
        proxy ? `-x '${host}'` : '',
        verbose ? '-v' : '',
        followRedirect ? '-L' : '',
        ...headerArgs,
        body,
        `'${url}'`
    ];

    try {
        const { stdout, stderr } = await execFile(CURL_PATH, args, { shell: '/bin/sh' });
        return { stderr, stdout };
    } catch (e) {
        const { stdout, stderr } = e;
        return { stderr, stdout };
    }
}

function addTo(app) {
    app.post('/curl/sync', async c => {
        const options = await c.req.json();
        return c.json(await runCurl(options));
    });

    app.post('/curl/batch', async c => {
        const { requests } = await c.req.json();
        const batch_id = uuidv4();

        const batched = requests.map(r => ({
            batch_id,
            url: r.url,
            params: JSON.stringify(r),
        }));

        await db.insertBatch(batched);

        return c.json({
            batch_id,
        });
    });
}

export default {
    addTo,
};