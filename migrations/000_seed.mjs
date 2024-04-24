import { sql } from 'kysely';

export async function up(db) {
    await db.schema
        .createTable('requests')
        .addColumn('id', 'integer', (col) => col.primaryKey())
        .addColumn('batch_id', 'integer')
        .addColumn('url', 'text', (col) => col.notNull())
        .addColumn('params', 'text')
        .addColumn('result', 'text')
        .addColumn('created_at', 'text', (col) =>
            col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
        )
        .addColumn('completed_at', 'text')
        .execute();
}

export async function down(db) {
    await db.schema.dropTable('requests').execute();
}