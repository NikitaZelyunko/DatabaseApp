"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var electron_1 = require("electron");
var DatabaseHandler = /** @class */ (function () {
    function DatabaseHandler(host, port, database) {
        this.host = host;
        this.port = port;
        this.database = database;
    }
    DatabaseHandler.prototype.connect = function (user) {
        if (this.pool) {
            this.pool.end();
        }
        this.pool = new pg_1.Pool({
            user: user.login,
            host: this.host,
            database: this.database,
            password: user.password,
            port: this.port,
        });
    };
    DatabaseHandler.prototype.disconnect = function () {
        if (this.pool) {
            return this.pool.end();
        }
        return Promise.resolve();
    };
    DatabaseHandler.prototype.query = function (query) {
        if (!this.pool) {
            return Promise.reject('not connected');
        }
        var connection = this.pool.connect();
        return connection.then(function (client) {
            return client.query(query);
        });
    };
    return DatabaseHandler;
}());
exports.DatabaseHandler = DatabaseHandler;
function createDatabaseHandler() {
    var handler = new DatabaseHandler('192.168.31.247', 5432, 'database2');
    electron_1.ipcMain.on('auth-request', function (event, user) {
        console.log('main', user);
        handler.connect(user);
        event.reply('auth-response', 'authenthicated');
    });
    electron_1.ipcMain.on('logout-request', function (event) {
        event.reply('logout-response', handler.disconnect());
    });
    electron_1.ipcMain.on('query-request', function (event, type, query) {
        console.log(type, query);
        handler.query(query).then(function (data) {
            event.reply('query-response', type, data);
        });
    });
    pg_1.types.setTypeParser(pg_1.types.builtins.NUMERIC, function (value) { return Number(value); });
}
exports.createDatabaseHandler = createDatabaseHandler;
//# sourceMappingURL=database-handler.js.map