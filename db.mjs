import fs from 'fs/promises';
import SQLite from 'better-sqlite3';
import { FileMigrationProvider, Migrator, Kysely, SqliteDialect } from 'kysely'

const DB_PATH = 'curl.sqlite3';
let db;

async function migrateToLatest() {
    await ensureDB();

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, 'migrations'),
        }),
    })

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

function insertBatch(requests) {
    return db.insertInto('requests')
        .values(requests)
        .execute();
}

function getBatchById(batch_id) {
    return db.selectFrom('requests')
        .selectAll()
        .where('batch_id', '=', batch_id)
        .execute();
}

async function getBatchProgressById(batch_id) {
    const batchTotalCount = await db.selectFrom('requests')
        .select((eb) => eb.fn.count('id'))
        .where('batch_id', '=', batch_id)
        .execute();

    const batchCompletedCount = await db.selectFrom('requests')
        .select((eb) => eb.fn.count('id'))
        .where('batch_id', '=', batch_id)
        .where('completed_at', '=', batch_id)
        .execute();

    return { batch_id, completed: batchCompletedCount, total: batchTotalCount };
}

function getOldestIncomplete(count = 6) {
    return db.selectFrom('requests')
        .selectAll()
        .where('completed_at', 'is', 'null')
        .orderBy('created_at', 'asc')
        .limit(count)
        .execute();
}

function updateRequest(request) {
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