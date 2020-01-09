import { Component } from '@angular/core';

import { DataService } from 'src/app/services/data.service';

@Component({
    selector: 'app-zad2',
    templateUrl: 'zad2.component.html',
    styleUrls: ['zad2.component.less']
})

export class Zad2Component {
    $table = this.dataService.getAbcentDays();

    constructor(
        private dataService: DataService
    ) { }
}
