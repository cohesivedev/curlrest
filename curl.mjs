import PQueue from 'p-queue';
import util from 'util';
import { execFile as execFileNonPromise } from 'child_process';
import db from './db.mjs';
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
};

const { CURL_PATH = '/usr/bin/curl' } = process.env;

async function run(options = DEFAULTS) {

    let { url, method, headers, body, verbose, followRedirect, proxy } = options;

    const headerArgs = headers ? Object.entries(headers).map(([key, value]) => `-H '${key}: ${value}'`) : [];

    body = body || '';
    if (body) {
        body = `--data-raw '${body}'`;
    }

    // Q: Why not just pass in args as a newline-delimited string?
    // A: Order of arguments matters, as well as providing more verbose params to be passed in
    // A2: There may be a future version of run() that will take a single-string `args` option
    const args = [
        `-X '${method}'`,
        proxy ? `-U '${proxy.username}:${proxy.password}'` : '',
        proxy ? `-x '${proxy.host}'` : '',
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

const queue = new PQueue({ concurrency: 6 });
async function churn(count = 6) {
    const batch = await db.getOldestIncomplete(count);

    for (const r of batch) {
        queue.add(async () => {
            const result = JSON.stringify(
                await run(JSON.parse(r.params))
            );


            const completed_at = (new Date()).toISOString();

            await db.updateRequest({
                id: r.id,
                result,
                completed_at,
            })
        });
    }
}

export default {
    run,
    churn,
}