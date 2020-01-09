import { Injectable } from '@angular/core';

import { of, BehaviorSubject } from 'rxjs';
import { first, switchMap, map, tap, filter } from 'rxjs/operators';

import { IpcService } from './ipc.service';
import { User } from 'src/models/user';
import { QueryResult } from 'pg';
import { Column, Table, Row } from '../models/table.model';

@Injectable()
export class DataService {
    $logged = new BehaviorSubject<boolean>(false);
    constructor(
        private ipcService: IpcService,
    ) { }

    getPaymentLastMonth() {
        return this.$logged.pipe(
            filter((isLogged) => isLogged),
            switchMap(() => {
                this.ipcService.send('query-request', 'payment-last-month', `select
                concat(surname,' ',left(first_name,1),'.', left(middle_name,1), '.') as fio ,
                position_name,
                cast(salary*worked_days/days_count+premium as numeric(128,2)) as first_pay,
                penalty,
                (cast(salary*worked_days/days_count+premium as numeric(128,2)) - penalty) as summary
                from
                (select worker_id, person_id, name as position_name, worked_days, days_count, salary from(
                    select worked_days, worker_id, work_day_count as days_count
                    from personal_payment.work_period as wp
                    inner join personal_payment.calc_period as calc_period
                    on calc_period.id=5 and wp.calc_period_id=calc_period.id
                ) as work_period
                inner join personal_payment.worker as worker
                on worker.id=work_period.worker_id
                inner join personal_payment.position as position
                on worker.position_id=position.id
                ) as worked_period
                inner join personal_payment.salary as salary
                on salary.work_period_id=worked_period.worker_id
                inner join personal_payment.person as person
                on person_id = person.id`);
                return this.ipcService.on('query-response').pipe(
                    filter((res) => res.args[0] === 'payment-last-month'),
                    map((res) => {
                        const queryRes: QueryResult = res.args[1];
                        const columnLabels = ['Фамилия И.О', 'Должность', 'Начисленная сумма', 'Сумма удержаний', 'Сумма к выдаче'];
                        const columnTypes: Column['type'][] = ['text', 'text', 'number', 'number', 'number'];
                        return Table.fromQuery(queryRes, columnLabels, columnTypes);
                    })
                );
            })
        );
    }

    getAbcentDays() {
        return this.$logged.pipe(
            filter((isLogged) => isLogged),
            switchMap(() => {
                this.ipcService.send('query-request', 'abcent-days', `select 
                worked_periods.cat_name, 
                SUM(calc_period.work_day_count - worked_days) as absenteeism, 
                cast(SUM(salary.premium)/count(*) as numeric(128, 2)) as avg_premium 
                from 
                (
                    select 
                        category.id as cat_id,
                        category.name as cat_name,
                        worker.id as worker_id,
                        work_period.id as work_period_id,
                        work_period.calc_period_id as calc_period_id,
                        work_period.worked_days as worked_days
                    from (
                        (
                        select 
                            id, name
                        from 
                            personal_payment."position"
                        ) as category
                        inner join personal_payment.worker as worker
                        on worker.position_id = category.id
                        inner join personal_payment.work_period as work_period
                        on work_period.worker_id = worker.id
                    )
                where 
                    work_period.type = true
                )as worked_periods
                inner join personal_payment.calc_period as calc_period
                on calc_period.id = worked_periods.calc_period_id
                inner join personal_payment.salary as salary
                on salary.work_period_id = worked_periods.work_period_id
                group by worked_periods.cat_name
                order by absenteeism desc`);
                return this.ipcService.on('query-response').pipe(
                    filter((res) => res.args[0] === 'abcent-days'),
                    map((res) => {
                        const queryRes: QueryResult = res.args[1];
                        const columnLabels = ['Должность', 'Сумма пропущенных дней', 'Среднемесячный размер выплаченных премий'];
                        const columnTypes: Column['type'][] = ['text', 'number', 'number'];
                        return Table.fromQuery(queryRes, columnLabels, columnTypes);
                    })
                )
            })
        )
    }

    getEducationStat() {
        return this.$logged.pipe(
            filter((isLogged) => isLogged),
            switchMap(() => {
                this.ipcService.send('query-request', 'abcent-days', `	select grad_cat.cat_name, 
                count(CASE
                WHEN grad_id = 1 THEN 1
                ELSE NULL
                END) as avg,
                count(CASE
                WHEN grad_id = 2 THEN 1
                ELSE NULL
                END) as avg_special,
                count(CASE
                WHEN grad_id = 3 THEN 1
                ELSE NULL
                END) as highest 
                from (select 
                    category.name as cat_name,
                    graduation.id as grad_id
                from
                    (
                    select 
                        id, name
                    from 
                        personal_payment."position"
                    ) as category
                    inner join personal_payment.worker as worker
                    on worker.position_id = category.id
                    inner join personal_payment.person as person
                    on worker.person_id = person.id
                    inner join personal_payment.graduation as graduation
                    on graduation.id = person.graduation_type) as grad_cat
                    group by grad_cat.cat_name
                    `);
                return this.ipcService.on('query-response').pipe(
                    filter((res) => res.args[0] === 'abcent-days'),
                    map((res) => {
                        const queryRes: QueryResult = res.args[1];
                        const columnLabels = ['Должность', 'Со средним образованием', 'Со средним специальным образованием', 'С высшим образованием'];
                        const columnTypes: Column['type'][] = ['text', 'number', 'number', 'number'];
                        return Table.fromQuery(queryRes, columnLabels, columnTypes);
                    })
                )
            })
        )
    }

    login(user: User) {
        return this.$logged.pipe(
            switchMap((isLogged) => {
                if (isLogged) {
                    return of(true);
                }
                this.ipcService.send('auth-request', user);
                return this.ipcService.on('auth-response').pipe(
                    map((response) => {
                        return !!response.args[0];
                    }),
                    tap((result) => {
                        this.$logged.next(result);
                    }),
                );
            })
        );
    }

    logout() {
        return this.$logged.pipe(
            switchMap((isLogged) => {
                if (isLogged) {
                    this.ipcService.send('logout-request');
                    return this.ipcService.on('logout-response').pipe(
                        map((response) => {
                            return true;
                        }),
                        tap((result) => {
                            this.$logged.next(!result);
                        })
                    );
                }
                return of(true);
            })
        );
    }
}
