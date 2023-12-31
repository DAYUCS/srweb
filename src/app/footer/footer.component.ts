import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  DataService,
  IFunction,
  IUserIntent,
  INavigateData,
  IUserIntentTrx,
} from '../data.service';
import '@cds/core/icon/register.js';
import {
  ClarityIcons,
  microphoneIcon,
  microphoneMuteIcon,
} from '@cds/core/icon';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

ClarityIcons.addIcons(microphoneIcon, microphoneMuteIcon);

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  navigateData!: INavigateData;
  subscription!: Subscription;
  @Input() recognizedText: string = '';
  @Input() parentName: string = '';
  recording = false;
  recognition: any;
  synth: any;
  voice: SpeechSynthesisVoice;

  ngOnInit() {
    this.subscription = this.dataService.currentData.subscribe(
      (nvData: INavigateData) => {
        this.navigateData = nvData;
      }
    );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Footer: ngOnChanges', changes);
  }

  constructor(private dataService: DataService, private router: Router) {
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
    if (this.parentName == 'trx') {
      // find out new fields values
      this.playVoice('Let me think about it...');
      this.dataService
        .callOpenAITrx(this.navigateData, this.recognizedText)
        .subscribe({
          next: (resp: IUserIntentTrx) => {
            // Handle the response data here
            console.log(resp);
            this.playVoice('OK, got it.');
            this.recognizedText = '';
            if (resp.intent == 'CHANGE' || resp.intent == 'CHANGE_CONFIRM') {
              let json = JSON.stringify(resp.trxData);
              let fields = JSON.parse(json);
              console.log(fields);
              for (let key in fields) {
                // check if key exists in lcData
                if (this.navigateData.data.lcData.hasOwnProperty(key)) {
                  const fullKey = 'navigateData.data.lcData.' + key;
                  this.navigateData.data.lcData[key] = fields[key];
                }
              }
              this.dataService.changedData(this.navigateData);
            } else if (resp.intent == 'CANCEL') {
              this.router.navigate(['template']);
            } else if (
              resp.intent == 'CONFIRM' ||
              resp.intent == 'CHANGE_CONFIRM'
            ) {
              //TODO submit form
              this.router.navigate(['home']);
            }
          },
          error: (error: any) => {
            // Handle errors here
            this.playVoice(
              'Sorry, I can not understand you. Please try again.'
            );
            console.error(error);
          },
        });
    } else if (this.parentName == 'home') {
      // identify function id and fields values
      this.playVoice('OK, wait a moment please...');
      this.dataService.callOpenAIFunction(this.recognizedText).subscribe({
        next: (resp: IFunction) => {
          // Handle the response data here
          console.log(resp);
          this.navigateData.selectedFunction = resp;
          this.dataService.changedData(this.navigateData);
          console.log(this.navigateData.selectedFunction);
          this.playVoice(
            'I will find some transaction templates for the function of ' +
              this.navigateData.selectedFunction.functionName
          );
          this.router.navigate(['template', this.recognizedText]);
          this.recognizedText = '';
        },
        error: (error: any) => {
          // Handle errors here
          this.playVoice('Sorry, I can not understand you. Please try again.');
          console.error(error);
        },
      });
    } else if (this.parentName == 'template') {
      //determine user's intent
      this.playVoice('OK, wait a moment please...');
      let theTemplates = this.navigateData.templates;
      this.dataService
        .callOpenAIIntent(this.recognizedText, theTemplates)
        .subscribe({
          next: (resp: IUserIntent) => {
            // Handle the response data here
            console.log(resp);
            console.log(this.navigateData);
            this.playVoice('OK, got it.');
            this.recognizedText = '';
            //resp.intent: SELECT_ONLY, CONTINUE, SELECT_CONTINUE or CANCEL
            if (
              resp.intent == 'SELECT_ONLY' ||
              resp.intent == 'SELECT_CONTINUE'
            ) {
              console.log(
                'update selectedTemplate with ' +
                  this.navigateData.templates[resp.selectedTemplate]
                    .referenceNumber
              );
              this.navigateData.selectedTemplate =
                this.navigateData.templates[resp.selectedTemplate];
              this.dataService.changedData(this.navigateData);
            }
            if (resp.intent == 'CANCEL') {
              this.router.navigate(['home']);
            }
            if (resp.intent == 'CONTINUE' || resp.intent == 'SELECT_CONTINUE') {
              //Merge data
              console.log('Navigate Data: ' + this.navigateData);
              let pageData = this.navigateData.data.lcData;
              let parameters =
                this.navigateData.selectedFunction.functionFields;
              parameters.forEach((field) => {
                (pageData as any)[field.fieldName as string] =
                  this.parseFieldValue(field.fieldType, field.fieldValue);
              });
              this.navigateData.data.lcData = pageData;
              this.dataService.changedData(this.navigateData);
              this.router.navigate(['trx']);
            }
          },
          error: (error: any) => {
            // Handle errors here
            this.playVoice(
              'Sorry, I can not understand you. Please try again.'
            );
            console.error(error);
          },
        });
    }
  }

  playVoice(text: string) {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    this.synth.speak(utterance);
  }

  parseFieldValue(
    fieldType: string,
    fieldValue: string
  ): string | number | Date {
    if (fieldType === 'AMOUNT') {
      return parseFloat(fieldValue);
    } else if (fieldType === 'DATE') {
      return new Date(fieldValue);
    } else {
      return fieldValue;
    }
  }
}
