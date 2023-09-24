import { Injectable } from '@angular/core';

export interface IData {
  trxType: string;
  trxNo: string;
  lcData: LCData;
}

export interface FormOfDocumentaryCredit {
  form: "IRREVOCABLE" |"IRREVOCABLE TRANSFERABLE";
}

export interface AvailableWithByCode{
  code: "BY ACCEPTANCE" | "BY DEF PAYMENT" | "BY MIXED PYMT" | "BY NEGOTIATION" | "BY PAYMENT";
}

export interface LCData {
  applicantBank: string;
  applicant: string;
  formOfDocumentaryCredit: FormOfDocumentaryCredit;
  beneficiaryBank:string;
  beneficiary: string;
  dateOfIssue: string;
  applicableRules: string;
  expiryDate: string;
  expiryPlace: string;
  currencyCode: string;
  amount: number;
  percentageCreditAmountTolerancePlus: number;
  percentageCreditAmountToleranceMinus: number;
  additionalAmountsCovered: string;
  availableWithByCode: AvailableWithByCode;
  draftsAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public data: IData = {
    trxType: "Document CREDIT",
    trxNo: "LC-00000001",
    lcData: {
      applicantBank: "BANK OF CHINA",
      applicant: "APPLICANT",
      formOfDocumentaryCredit: {
        form: "IRREVOCABLE TRANSFERABLE"
      },
      beneficiaryBank: "BANK OF INDIA",
      beneficiary: "BENEFICIARY",
      dateOfIssue: "01/01/2019",
      applicableRules: "RULES",
      expiryDate: "01/01/2020",
      expiryPlace: "PLACE",
      currencyCode: "CNY",
      amount: 10000000000,
      percentageCreditAmountTolerancePlus: 10,
      percentageCreditAmountToleranceMinus: 10,
      additionalAmountsCovered: "ADDITIONAL AMOUNTS",
      availableWithByCode: {
        code: "BY ACCEPTANCE"
      },
      draftsAt: "DRAFTS AT"
    }
  };

  constructor() {}

  public getData(): IData {
    return this.data;
  }
  
}
