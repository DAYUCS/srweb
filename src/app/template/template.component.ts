import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DataService,
  IFunction,
  INavigateData,
  ITemplate,
} from '../data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit, OnDestroy {
  parentName: string = 'template';
  navigateData!: INavigateData;
  reqFunction!: IFunction;
  subscription!: Subscription;

  ngOnInit() {
    this.subscription = this.dataService.currentData.subscribe((data) => {
      this.navigateData = data;
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  constructor(private dataService: DataService) {}
}
