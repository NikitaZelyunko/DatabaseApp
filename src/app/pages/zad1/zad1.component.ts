import { Component, ChangeDetectionStrategy, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, DoCheck } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { tap, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-zad1',
    templateUrl: 'zad1.component.html',
    styleUrls: ['zad1.component.less'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class Zad1Component implements OnInit, AfterViewInit, OnChanges, DoCheck {
    $table = this.dataService.getPaymentLastMonth().pipe(startWith({}));
    constructor(
        private dataService: DataService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.$table = this.dataService.getPaymentLastMonth();
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    ngOnChanges() {
        console.log('changes');
    }

    ngDoCheck() {
        console.log('check');
    }
}
