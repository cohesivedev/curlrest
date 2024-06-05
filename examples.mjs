// You will need to run the server locally:
// USERNAME=a PASSWORD=a node index.mjs

// For 'sync-with-proxy':
// PROXYUSER= PROXYPASS= USERNAME=a PASSWORD=a node index.mjs

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('a:a').toString('base64'),
};

const HOST = process.env.HOST || 'http://localhost:3001';

const { PROXYUSER, PROXYPASS } = process.env;

function run(type) {
    switch (type) {
        case 'sync-with-proxy':
            fetch(`${HOST}/curl/sync`, {
                headers,
                method: 'post',
                body: JSON.stringify({
                    proxy: {
                        host: 'pr.oxylabs.io:7777',
                        username: PROXYUSER,
                        password: PROXYPASS,
                    },
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json',
                    },
                    url: 'https://ip.oxylabs.io',
                })
            }).then(res => res.json()).then(res => console.log(res));
        case 'sync':
            fetch(`${HOST}/curl/sync`, {
                headers,
                method: 'post',
                body: JSON.stringify({
                    method: 'GET',
                    followRedirect: true,
                    url: 'https://www.bbc.com/news/world-asia-india-68968593',
                })
            }).then(res => res.json()).then(res => console.log(res));

            break;
        case 'batch':
            const requests = [
                {
                    method: 'GET',
                    url: 'https://ip.oxylabs.io',
                },
                {
                    method: 'GET',
                    url: 'https://api.ipify.org?format=json',
                },
                {
                    method: 'GET',
                    url: 'https://api.my-ip.io/v2/ip.txt',
                },
                {
                    method: 'GET',
                    followRedirect: true,
                    url: 'https://api.my-ip.io/ip.csv',
                },
                {
                    method: 'GET',
                    url: 'https://ifconfig.me/',
                },
                {
                    method: 'GET',
                    url: 'https://ifconfig.me/ua',
                },
                {
                    method: 'GET',
                    url: 'https://ifconfig.me/all',
                },
            ].filter(Boolean);

            fetch(`${HOST}/curl/batch`, {
                method: 'post',
                headers,
                body: JSON.stringify(requests),
            }).then(res => res.json()).then(res => console.log(res));
            break;

        case 'progress':
            fetch(`${HOST}/curl/batch/progress/06034490-8d50-41ca-a4ab-e5c5ef6d9b83`, {
                headers,
            }).then(res => res.json()).then(res => console.log(res));
            break;

        case 'churn':
            fetch(`${HOST}/curl/batch/churn?count=3`, {
                headers,
            }).then(res => res.text()).then(res => console.log(res));
            break;
    }

}

run('sync');