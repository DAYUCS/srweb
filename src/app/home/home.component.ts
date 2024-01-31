import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  recognizedText: string = '';
  parentName: string = 'home';
  cardTitles: string[] = [
    'Register Letter of Credit',
    'Register Letter of Credit',
    'Register Letter of Credit',
  ];
  cardTexts: string[] = [
    'ABC Ltd. Corp. applied for a non-transferable letter of credit worth CNY 100,000',
    'Microsoft Corp. applied for a transferable letter of credit worth USD 200,000',
    'TD Ltd. Corp. applied for a non-transferable letter of credit worth JPY 100,000,000 advised by BOC',
  ];

  tryButtonClick(index: number) {
    this.recognizedText = this.cardTexts[index];
    console.log(this.recognizedText);
  }
}
