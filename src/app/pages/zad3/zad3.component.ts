import { Component } from '@angular/core';

import { DataService } from 'src/app/services/data.service';

@Component({
    selector: 'app-zad3',
    templateUrl: 'zad3.component.html',
    styleUrls: ['zad3.component.less']
})

export class Zad3Component {
    $table = this.dataService.getEducationStat();

    constructor(
        private dataService: DataService
    ) { }
}