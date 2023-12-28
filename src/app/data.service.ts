import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IData {
  trxType: string;
  trxNo: string;
  lcData: LCData;
}

export interface IDataResponse {
  success: boolean;
  data: LCData;
}

export interface FormOfDocumentaryCredit {
  form: 'IRREVOCABLE' | 'IRREVOCABLE TRANSFERABLE';
}

export interface AvailableWithByCode {
  code:
    | 'BY ACCEPTANCE'
    | 'BY DEF PAYMENT'
    | 'BY MIXED PYMT'
    | 'BY NEGOTIATION'
    | 'BY PAYMENT';
}

export interface LCData {
  applicantBank: string;
  applicant: string;
  formOfDocumentaryCredit: FormOfDocumentaryCredit;
  beneficiaryBank: string;
  beneficiary: string;
  dateOfIssue: Date;
  applicableRules: string;
  expiryDate: Date;
  expiryPlace: string;
  currencyCode: string;
  amount: number;
  percentageCreditAmountTolerancePlus: number;
  percentageCreditAmountToleranceMinus: number;
  additionalAmountsCovered: string;
  availableWithByCode: AvailableWithByCode;
  draftsAt: string;
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

export interface IIntent {
  intent: string;
  selectedTemplate: ITemplate;
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
      applicant: 'APPLICANT',
      formOfDocumentaryCredit: {
        form: 'IRREVOCABLE TRANSFERABLE',
      },
      beneficiaryBank: 'BANK OF INDIA',
      beneficiary: 'BENEFICIARY',
      dateOfIssue: new Date('9/29/2023'),
      applicableRules: 'UCP 600',
      expiryDate: new Date('12/01/2023'),
      expiryPlace: 'Nanjing China',
      currencyCode: 'CNY',
      amount: 10000000000,
      percentageCreditAmountTolerancePlus: 10,
      percentageCreditAmountToleranceMinus: 10,
      additionalAmountsCovered: 'ADDITIONAL AMOUNTS',
      availableWithByCode: {
        code: 'BY ACCEPTANCE',
      },
      draftsAt: 'DRAFTS AT',
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

  public callOpenAITrx(data: IData, recognizedText: string): IData {
    const command = { command: recognizedText };
    const oldData = { data: data.lcData };
    const request = Object.assign(oldData, command);
    console.log(request);

    this.http
      .post<IDataResponse>(`http://10.39.101.186:4000/api/lcTrx`, request)
      .subscribe((result) => {
        console.log(result.data);
        if (result.success) {
          this.navigateData.data.lcData = result.data;
          this.dataSource.next(this.navigateData);
        }
      });

    return this.navigateData.data;
  }

  public callOpenAIFunction(recognizedText: string): Observable<IFunction> {
    const apiUrl = this.baseUrl + '/function/find';
    const userCommand = `"` + recognizedText + `"`;
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(userCommand)}`;
    return this.http.get<IFunction>(fullUrl);
  }

  public callOpenAITemplates(recognizedText: string): Observable<ITemplateVector[]> {
    const apiUrl = this.baseUrl + '/template/search';
    const userCommand = `"` + recognizedText + `"`;
    const unitCode = "HED0001";
    const moduleName = this.navigateData.selectedFunction.functionModule;
    const customerId = "CUST-00000001";
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(
      userCommand
    )}&unitCode=${encodeURIComponent(unitCode)}&moduleName=${encodeURIComponent(
      moduleName
    )}&customerId=${encodeURIComponent(customerId)}`;
    return this.http.get<ITemplateVector[]>(fullUrl);
  }

  public callOpenAIIntent(recognizedText: string, templates: ITemplate[]): Observable<IIntent> {
    const apiUrl = this.baseUrl + '/template/select';
    const userCommand = `"` + recognizedText + `"`;
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(userCommand)}`;
    return this.http.post<IIntent>(fullUrl, templates);
  }
}
