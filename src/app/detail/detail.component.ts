import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService, INavigateData } from '../data.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  navigateData!: INavigateData;
  subscription!: Subscription;

  constructor(private dataService: DataService) {}
  ngOnInit() {
    this.subscription = this.dataService.currentData.subscribe((data) => {
      this.navigateData = data;
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateDataField(fieldName: string, fieldValue: any) {
    this.dataService.updateField(fieldName, fieldValue);
  }
}
