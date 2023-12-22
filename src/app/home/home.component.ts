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
    'Chinasystems Ltd. Corp. applied for a non-transferable letter of credit worth US$100,000',
    'Microsoft China Corp. applied for a transferable letter of credit worth EUR 200,000',
    'Chinasystems Ltd. Corp. applied for a non-transferable letter of credit worth US$100,000 advised by JPMorgan',
  ];

  tryButtonClick(index: number) {
    this.recognizedText = this.cardTexts[index];
    console.log(this.recognizedText);
  }
}
