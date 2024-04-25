import { v4 as uuidv4 } from 'uuid';
import curl from '../curl.mjs';
import db from '../db.mjs';

function addTo(app) {
    app.post('/curl/sync', async c => {
        const options = await c.req.json();
        return c.json(await curl.run(options));
    });

    app.post('/curl/batch', async c => {
        const requests = await c.req.json();
        const batch_id = uuidv4();

        const batched = requests.map(r => ({
            batch_id,
            url: r.url,
            params: JSON.stringify(r),
        }));

        await db.insertBatch(batched);

        return c.json({ batch_id });
    });

    app.get('/curl/batch/progress/:id', async c => {
        const { id } = c.req.param();

        return c.json(await db.getBatchProgressById(id));
    });

    app.get('/curl/batch/churn', async c => {
        const { count = 6 } = c.req.query();
        await curl.churn(parseInt(count.toString(), 10));

        return c.text('OK');
    });
}

export default {
    addTo,
};