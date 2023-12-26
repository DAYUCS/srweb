import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

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

export interface IFunctionResponse {
  success: boolean;
  data: IFunction;
}

export interface ITemplate {
  transactionSummary: string;
  unitCode: string;
  moduleName: string;
  referenceNumber: string;
  eventNumber: number;
  customerId: string;
}

export interface ITemplateResponse {
  success: boolean;
  data: ITemplate;
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

  private reqFunction: IFunction = {
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
    selectedFunction: this.reqFunction,
    selectedTemplate: this.selectedTemplate,
    templates: [],
    data: this.data,
  };

  private dataSource = new BehaviorSubject<INavigateData>(this.navigateData);
  currentData = this.dataSource.asObservable();

  constructor(private http: HttpClient) {}

  changedData(data: INavigateData) {
    this.navigateData = data;
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
          data.lcData = result.data;
        }
      });

    return data;
  }

  public callOpenAIFunction(recognizedText: string): IFunction {
    const apiUrl = this.baseUrl + '/function/find';
    const userCommand = `"` + recognizedText + `"`;
    const fullUrl = `${apiUrl}?userCommand=${encodeURIComponent(userCommand)}`;
    const request = Object.assign({ command: recognizedText });
    this.http.get<IFunctionResponse>(fullUrl).subscribe(
      (resp) => {
        // Handle the response data here
        console.log(resp);
        this.reqFunction = resp.data;
      },
      (error) => {
        // Handle errors here
        console.error(error);
      }
    );

    return this.reqFunction;
  }
}
