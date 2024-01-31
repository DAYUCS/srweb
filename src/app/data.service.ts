import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

export interface IData {
  trxType: string;
  trxNo: string;
  lcData: LCData;
}

export interface IDataResponse {
  success: boolean;
  data: LCData;
}

export interface LCData {
  [key: string]: string | number | Date;
  applicantBank: string;
  APPLICANT: string;
  FORM_OF_LC: string;
  beneficiaryBank: string;
  beneficiary: string;
  dateOfIssue: Date;
  APLB_RULE: string;
  EXPIRY_DT: Date;
  EXPIRY_PLC: string;
  LC_CCY: string;
  LC_AMT: number;
  percentageCreditAmountTolerancePlus: number;
  percentageCreditAmountToleranceMinus: number;
  additionalAmountsCovered: string;
  AVAL_BY: string;
  draftsAt: string;
  ADVISE_BANK: string;
}

export interface FunctionField {
  fieldName: string;
  fieldType: string;
  fieldValue: string;
  fieldDescription: string;
}

export interface IFunction {
  functionName: string;
  functionId: string;
  functionModule: string;
  functionDescription: string;
  functionFields: FunctionField[];
}

export interface ITemplate {
  transactionSummary: string;
  unitCode: string;
  moduleName: string;
  referenceNumber: string;
  eventNumber: number;
  customerId: string;
}

export interface ITemplateVector {
  id: string;
  version: number;
  score: number;
  payload: ITemplate;
  vector: string;
  shard_key: string;
}

export interface IUserIntent {
  intent: string;
  selectedTemplate: number;
}

export interface IUserIntentTrx {
  intent: string;
  trxData: any;
}

export interface INavigateData {
  selectedFunction: IFunction;
  selectedTemplate: ITemplate;
  templates: ITemplate[];
  data: IData;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  baseUrl = 'http://10.39.101.186:8000';

  private selectedFunction: IFunction = {
    functionName: '',
    functionId: '',
    functionModule: '',
    functionDescription: '',
    functionFields: [],
  };

  private selectedTemplate: ITemplate = {
    transactionSummary: '',
    unitCode: '',
    moduleName: '',
    referenceNumber: '',
    eventNumber: 0,
    customerId: '',
  };

  private data: IData = {
    trxType: 'Document CREDIT',
    trxNo: 'LC-00000001',
    lcData: {
      applicantBank: 'BANK OF CHINA',
      APPLICANT: 'APPLICANT',
      FORM_OF_LC: 'IRREVOCABLE TRANSFERABLE',
      beneficiaryBank: 'BANK OF INDIA',
      beneficiary: 'BENEFICIARY',
      dateOfIssue: new Date('9/29/2023'),
      APLB_RULE: 'UCP 600',
      EXPIRY_DT: new Date('12/01/2023'),
      EXPIRY_PLC: 'Nanjing China',
      LC_CCY: 'CNY',
      LC_AMT: 10000000000,
      percentageCreditAmountTolerancePlus: 10,
      percentageCreditAmountToleranceMinus: 10,
      additionalAmountsCovered: 'ADDITIONAL AMOUNTS',
      AVAL_BY: 'BY ACCEPTANCE',
      draftsAt: 'DRAFTS AT',
      ADVISE_BANK: 'Bank of China',
    },
  };

  private navigateData: INavigateData = {
    selectedFunction: this.selectedFunction,
    selectedTemplate: this.selectedTemplate,
    templates: [],
    data: this.data,
  };

  private dataSource = new BehaviorSubject<INavigateData>(this.navigateData);
  currentData = this.dataSource.asObservable();

  constructor(private http: HttpClient) {}

  changedData(nvData: INavigateData) {
    this.navigateData = nvData;
    this.dataSource.next(this.navigateData);
  }

  updateField(field: string, value: any) {
    const currentData = this.dataSource.value;
    const newData = { ...currentData, [field]: value };
    this.dataSource.next(newData);
    console.log(newData);
  }

  public callOpenAITrx(
    data: INavigateData,
    recognizedText: string
  ): Observable<IUserIntentTrx> {
    const apiUrl = this.baseUrl + '/function/process';
    const userCommand = `"` + recognizedText + `"`;
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(userCommand)}`;
    const mergedJson = {
      functionData: data.selectedFunction,
      trxData: data.data.lcData,
    };
    console.log(mergedJson);
    return this.http.post<IUserIntentTrx>(fullUrl, mergedJson, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public callOpenAIFunction(recognizedText: string): Observable<IFunction> {
    const apiUrl = this.baseUrl + '/function/find';
    const userCommand = `"` + recognizedText + `"`;
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(userCommand)}`;
    return this.http.get<IFunction>(fullUrl);
  }

  public callOpenAITemplates(
    recognizedText: string
  ): Observable<ITemplateVector[]> {
    const apiUrl = this.baseUrl + '/template/search';
    const userCommand = `"` + recognizedText + `"`;
    const unitCode = 'HED0001';
    const moduleName = this.navigateData.selectedFunction.functionModule;
    const customerId = 'CUST-00000001';
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(
      userCommand
    )}&unitCode=${encodeURIComponent(unitCode)}&moduleName=${encodeURIComponent(
      moduleName
    )}&customerId=${encodeURIComponent(customerId)}`;
    return this.http.get<ITemplateVector[]>(fullUrl);
  }

  public callOpenAIIntent(
    recognizedText: string,
    templates: ITemplate[]
  ): Observable<IUserIntent> {
    const apiUrl = this.baseUrl + '/template/select';
    const userCommand = `"` + recognizedText + `"`;
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(userCommand)}`;
    return this.http.post<IUserIntent>(fullUrl, templates);
  }
}
