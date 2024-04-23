import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import curlRoutes from './routes/curlRoutes.mjs';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
}));

let authMiddleware = null;
app.use('/*', async (c, next) => {
    // Allocate basic auth middleware
    if (!authMiddleware) {
        const { USERNAME: username, PASSWORD: password } = process.env;
        authMiddleware = basicAuth({ username, password });
    }

    return authMiddleware(c, next);
});

curlRoutes.addTo(app);

serve({
    fetch: app.fetch,
    port: process.env.PORT || 3001,
}, info => console.log(`Ready on port ${info.port}`));