
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';
import { Subscription } from 'rxjs/Subscription';
import { MatTabChangeEvent } from '@angular/material';

import { ModalsService } from '../modals/modals.service';
import { Transaction } from '../shared/transaction/transaction.model';
import { FilterService } from './filter.service';
import { faq } from './faq';
import { FAQ } from '../shared/faq.model';

@Component({
  selector: 'wallet-transactions',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionsComponent implements OnInit, OnDestroy {

  showFilter: boolean;
  amountFilter: string;
  amountFilterValue: number;
  dateFilter: string = 'all';
  categoryFilterValue: string = 'all';
  faq: Array<FAQ> = faq;
  
  filterData = (): any => {
    return { 
      amountFilter: this.amountFilter,
      amountFilterValue: this.amountFilterValue,
      category: this.categoryFilterValue,
      dateFilter: this.dateFilter
    };
  };

  private log: any = Log.create('main.component');
  private filterSubscription: Subscription;
  private destroyed: boolean;

  constructor(private modalsService: ModalsService,
              private filterService: FilterService
  ) {
  }

  ngOnInit() {
    this.filterSubscription = this.filterService.filterEvent
      .subscribe(value => {
        if (value === 'toggle') {
          this.toggleFilter();
        }
      });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
    this.destroyed = true;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  applyFilter() {
    this.filterService.apply();
    this.showFilter = false;
  }

  clearFilter() {
    this.dateFilter = '';
    this.amountFilter = '';
    this.amountFilterValue = null;
  }

  setCategory(event: MatTabChangeEvent) {
    switch (event.index) {
      case 0: {
        this.categoryFilterValue = 'all';
        break;
      }
      case 1: {
        this.categoryFilterValue = 'send';
        break;
      }
      case 2: {
        this.categoryFilterValue = 'receive';
        break;
      }
      case 3: {
        this.categoryFilterValue = 'move';
        break;
      }
      case 4: {
        this.categoryFilterValue = 'node';
        break;
      }
    }
    // this.applyFilter();
  }
}
