import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import SQLite from 'better-sqlite3';
import { sql, FileMigrationProvider, Migrator, Kysely, SqliteDialect } from 'kysely'

const DB_PATH = 'curl.sqlite3';
let db;

async function migrateToLatest() {
    await ensureDB();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, 'migrations'),
        }),
    });

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`);
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`);
        }
    })

    if (error) {
        console.error('Failed to migrate');
        console.error(error);
        process.exit(1);
    }
}

async function ensureDB() {
    if (db) return;

    // Create empty file if run for the first time
    const file = await fs.open(DB_PATH, 'a');
    await file.close();

    db = new Kysely({
        dialect: new SqliteDialect({
            database: new SQLite(DB_PATH),
        }),
    });

    await migrateToLatest();
}

async function insertBatch(requests) {
    await ensureDB();

    return db.insertInto('requests')
        .values(requests)
        .execute();
}

async function getBatchById(batch_id) {
    await ensureDB();

    return db.selectFrom('requests')
        .selectAll()
        .where('batch_id', '=', batch_id)
        .execute();
}

async function getBatchProgressById(batch_id) {
    await ensureDB();

    const batchTotalCount = Object.values(
        await db.selectFrom('requests')
            .select((eb) => eb.fn.count('id'))
            .where('batch_id', '=', batch_id)
            .executeTakeFirst()
    )[0];

    const batchCompletedCount = Object.values(
        await db.selectFrom('requests')
            .select(eb => eb.fn.count('id'))
            .where('batch_id', '=', batch_id)
            .where('completed_at', 'is not', '')
            .where('completed_at', 'is not', null)
            .executeTakeFirst()
    )[0];

    return {
        batch_id,
        completed: batchCompletedCount,
        total: batchTotalCount,
        done: batchCompletedCount === batchTotalCount,
    };
}

async function getOldestIncomplete(count = 6) {
    await ensureDB();

    return db.selectFrom('requests')
        .selectAll()
        .where('completed_at', 'is', null)
        .where('completed_at', 'is', '')
        .orderBy('created_at', 'asc')
        .limit(count)
        .execute();
}

async function updateRequest(request) {
    await ensureDB();

    return db.updateTable('requests')
        .set(request)
        .where('id', '=', request.id)
        .execute();
}

export default {
    migrateToLatest,
    insertBatch,
    getBatchById,
    getBatchProgressById,
    getOldestIncomplete,
    updateRequest,
};