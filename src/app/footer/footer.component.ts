import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService, IData } from '../data.service';
import { Subscription } from 'rxjs';
import '@cds/core/icon/register.js';
import {
  ClarityIcons,
  microphoneIcon,
  microphoneMuteIcon,
  userIcon,
} from '@cds/core/icon';

ClarityIcons.addIcons(microphoneIcon, microphoneMuteIcon);

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  trxData!: IData;
  subscription!: Subscription;
  recognizedText: string = '';
  recording = false;
  recognition: any;
  synth: any;
  voice: SpeechSynthesisVoice;

  ngOnInit() {
    this.subscription = this.data.currentData.subscribe((data) => {
      this.trxData = data;
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  constructor(private data: DataService) {
    this.recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.addEventListener('result', (event: any) => {
      this.recognizedText = event.results[0][0].transcript;
      console.log(`Confidence: ${event.results[0][0].confidence}`);
    });

    this.synth = window.speechSynthesis;
    this.voice = this.synth
      .getVoices()
      .filter((v: SpeechSynthesisVoice) => v.lang === 'en-US')[0];
  }

  startRecording() {
    this.recording = true;
    this.recognizedText = '';
    this.recognition.start();
  }

  stopRecording() {
    this.recording = false;
    this.recognition.stop();
    if (this.recognizedText && this.recognizedText.length > 0) {
      this.callOpenAI();
    }
  }

  callOpenAI() {
    this.playVoice('Let me ask Open AI for advice');
    this.trxData = this.data.callOpenAI(this.trxData, this.recognizedText);
    this.data.changedData(this.trxData);
    this.recognizedText = '';
    console.log(this.trxData);
    this.playVoice('Please wait a moment, the results will come out shortly.');
  }

  playVoice(text: string) {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    this.synth.speak(utterance);
  }
}
