import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService, IData } from '../data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  trxData!: IData;
  subscription!: Subscription;

  constructor(private data: DataService) {}
  ngOnInit() {
    this.subscription = this.data.currentData.subscribe((data) => {
      this.trxData = data;
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateDataField(fieldName: string, fieldValue: any) {
    this.data.updateField(fieldName, fieldValue);
  }
}
