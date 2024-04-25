// You will need to run the server locally:
// USERNAME=a PASSWORD=a node index.mjs

// For 'sync-with-proxy':
// PROXYUSER= PROXYPASS= USERNAME=a PASSWORD=a node index.mjs

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('a:a').toString('base64'),
};

function run(type) {

    switch (type) {
        case 'sync-with-proxy':
            const { PROXYUSER, PROXYPASS } = process.env;
            fetch('http://localhost:3001/curl/sync', {
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

            fetch('http://localhost:3001/curl/batch', {
                method: 'post',
                headers,
                body: JSON.stringify(requests),
            }).then(res => res.json()).then(res => console.log(res));
            break;

        case 'progress':
            fetch('http://localhost:3001/curl/batch/progress/06034490-8d50-41ca-a4ab-e5c5ef6d9b83', {
                headers,
            }).then(res => res.json()).then(res => console.log(res));
            break;

        case 'churn':
            fetch('http://localhost:3001/curl/batch/churn?count=3', {
                headers,
            }).then(res => res.text()).then(res => console.log(res));
            break;
    }

}

run('sync');