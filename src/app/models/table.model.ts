import { QueryResult } from 'pg';

export class Column {
    constructor(
        public name: string,
        public label: string,
        public type: 'text' | 'number' | 'date'
    ) {}
}

export class Row {
    constructor(
        public values: any[]
    ) {}
}

export class Table {
    constructor(
        public header: Column[],
        public rows: Row[]
    ) { }

    static fromQuery(queryRes: QueryResult, columnLabels: string[], columnTypes: Column['type'][]) {
        const header = queryRes.fields.map(
            (field, index) => new Column(field.name, columnLabels[index], columnTypes[index])
        );
        const columnNames = header.map((column) => column.name);
        const rows = queryRes.rows.map((row) => new Row(columnNames.map((name) => row[name])));
        return new Table(header, rows);
    }
}
