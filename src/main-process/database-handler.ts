import { Pool, types } from 'pg';
import { User } from '../models/user';
import { ipcMain } from 'electron';

export class DatabaseHandler {

    pool: Pool;

    constructor(
        public host: string,
        public port: number,
        public database: string
    ) { }

    connect(user: User) {
        if (this.pool) {
            this.pool.end();
        }
        this.pool = new Pool({
            user: user.login,
            host: this.host,
            database: this.database,
            password: user.password,
            port: this.port,
        });
    }

    disconnect() {
        if (this.pool) {
            return this.pool.end();
        }
        return Promise.resolve();
    }

    query(query: string) {
        if (!this.pool) {
            return Promise.reject('not connected');
        }
        const connection = this.pool.connect();
        return connection.then((client) => {
            return client.query(query);
        });
    }
}

export function createDatabaseHandler() {
    const handler = new DatabaseHandler('192.168.31.247', 5432, 'database2');
    ipcMain.on('auth-request', (event, user: User) => {
        console.log('main', user);
        handler.connect(user);
        event.reply('auth-response', 'authenthicated');
    });

    ipcMain.on('logout-request', (event) => {
        event.reply('logout-response', handler.disconnect());
    });

    ipcMain.on('query-request', (event, type, query) => {
        console.log(type, query);
        handler.query(query).then((data) => {
            event.reply('query-response', type, data);
        });
    });

    types.setTypeParser(types.builtins.NUMERIC, (value) => Number(value));
}
