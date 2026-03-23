import { CalculatorService } from './calculator.service';
export declare class CalculatorController {
    private calc;
    constructor(calc: CalculatorService);
    rentVsBuy(body: Record<string, number>): {
        rentCost5Y: number;
        buyCost5Y: number;
        emi: number;
        breakevenYears: number;
        recommendation: string;
    };
    roi(body: {
        purchasePrice: number;
        salePrice: number;
        costs?: number;
    }): {
        roiPct: number;
        netGain: number;
    };
    irr(body: {
        cashFlows: number[];
        years?: number[];
    }): {
        irrPct: number;
    };
    downPayment(body: Record<string, number>): {
        downPayment: number;
        loanAmount: number;
        emi: number;
        totalInterest: number;
    };
    taxEstimate(body: {
        countryCode: string;
        propertyPrice: number;
    }): {
        stampDuty: number;
        registration: number;
        gst: number;
        total: number;
    };
}
