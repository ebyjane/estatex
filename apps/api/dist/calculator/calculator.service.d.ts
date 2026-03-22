export declare class CalculatorService {
    rentVsBuy(input: {
        propertyPrice: number;
        downPaymentPct: number;
        loanTermYears: number;
        interestRatePct: number;
        monthlyRent: number;
    }): {
        rentCost5Y: number;
        buyCost5Y: number;
        emi: number;
        breakevenYears: number;
        recommendation: string;
    };
    roi(input: {
        purchasePrice: number;
        salePrice: number;
        costs: number;
    }): {
        roiPct: number;
        netGain: number;
    };
    irr(cashFlows: number[], years: number[]): {
        irrPct: number;
    };
    downPayment(input: {
        propertyPrice: number;
        downPaymentPct: number;
        interestRatePct: number;
        loanTermYears: number;
    }): {
        downPayment: number;
        loanAmount: number;
        emi: number;
        totalInterest: number;
    };
    taxEstimate(countryCode: string, propertyPrice: number): {
        stampDuty: number;
        registration: number;
        gst: number;
        total: number;
    };
}
