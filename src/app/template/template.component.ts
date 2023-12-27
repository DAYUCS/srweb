import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataService, INavigateData } from '../data.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit, OnDestroy {
  userCommand!: string;
  parentName: string = 'template';
  navigateData!: INavigateData;
  subscription!: Subscription;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userCommand = params['userCommand'];
      console.log(this.userCommand);
      this.dataService
        .callOpenAITemplates(this.userCommand)
        .subscribe((data) => {
          this.navigateData.templates = data.map((t) => t.payload);
          this.dataService.changedData(this.navigateData);
        });
    });

    this.subscription = this.dataService.currentData.subscribe((nvData) => {
      this.navigateData = nvData;
      console.log(this.navigateData);
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Template: ngOnChanges', changes);
  }

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}
}
