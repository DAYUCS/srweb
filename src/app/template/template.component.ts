import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService, INavigateData, ITemplateVector } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

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
    this.subscription = this.dataService.currentData.subscribe(
      (nvData: INavigateData) => {
        this.navigateData = nvData;
        console.log(this.navigateData);
      }
    );

    this.route.params.subscribe((params: { [x: string]: string }) => {
      this.userCommand = params['userCommand'];
      console.log(this.userCommand);
      this.dataService
        .callOpenAITemplates(this.userCommand)
        .subscribe((data: ITemplateVector[]) => {
          this.navigateData.templates = data
            .sort((t1, t2) => t2.score - t1.score)
            .map((t) => t.payload);
          this.navigateData.selectedTemplate = this.navigateData.templates[0];
          this.dataService.changedData(this.navigateData);
        });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}
}
