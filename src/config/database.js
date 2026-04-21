const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let dbInstance;

async function getDb() {
    if (!dbInstance) {
        // Open the SQLite database
        dbInstance = await open({
            filename: path.join(__dirname, '..', '..', 'database.sqlite'),
            driver: sqlite3.Database
        });
        
        // Ensure foreign keys are enabled
        await dbInstance.run('PRAGMA foreign_keys = ON');

        // Check if DB is already initialized by looking for the users table
        const hasUsers = await dbInstance.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        
        if (!hasUsers) {
            console.log("Inicializando o banco de dados SQLite com as tabelas...");
            const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf-8');
                await dbInstance.exec(schema);
                console.log("Banco de dados SQLite gerado com sucesso! Login do admin ativado.");
            } else {
                console.warn("Aviso: arquivo schema.sql não encontrado. Banco criado vazio.");
            }
        }

        // MIGRATIONS
        try { await dbInstance.run("ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0"); } catch(e) {}
        try { await dbInstance.run("ALTER TABLE users ADD COLUMN last_active DATETIME"); } catch(e) {}
    }
    return dbInstance;
}

module.exports = { getDb };
