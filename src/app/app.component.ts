import { Component, inject } from '@angular/core';
import { IData, LCData, FormOfDocumentaryCredit, AvailableWithByCode, DataService } from './data.service';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private data = inject(DataService);
  recognizedText: string = '';
  recording = false;
  recognition: any;
  trxData: IData = this.data.getData();
  
  constructor() {
    this.recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.addEventListener('result', (event: any) => {
      this.recognizedText = event.results[0][0].transcript;
      console.log(`Confidence: ${event.results[0][0].confidence}`);
    });
  }

  startRecording() {
    this.recording = true;
    this.recognizedText = '';
    this.recognition.start();
  }

  stopRecording() {
    this.recording = false;
    this.recognition.stop();
  }

}
