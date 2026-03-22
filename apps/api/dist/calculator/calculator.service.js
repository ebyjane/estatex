"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorService = void 0;
const common_1 = require("@nestjs/common");
let CalculatorService = class CalculatorService {
    rentVsBuy(input) {
        const down = (input.propertyPrice * input.downPaymentPct) / 100;
        const principal = input.propertyPrice - down;
        const monthlyRate = input.interestRatePct / 100 / 12;
        const n = input.loanTermYears * 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        const rentCost5Y = input.monthlyRent * 60;
        const buyCost5Y = down + emi * 60;
        const breakevenYears = rentCost5Y / (emi - input.monthlyRent) / 12;
        const recommendation = buyCost5Y < rentCost5Y ? 'buy' : 'rent';
        return {
            rentCost5Y,
            buyCost5Y,
            emi: Math.round(emi * 100) / 100,
            breakevenYears: Math.round(breakevenYears * 10) / 10,
            recommendation,
        };
    }
    roi(input) {
        const netGain = input.salePrice - input.purchasePrice - input.costs;
        const roiPct = (netGain / input.purchasePrice) * 100;
        return { roiPct: Math.round(roiPct * 100) / 100, netGain };
    }
    irr(cashFlows, years) {
        let rate = 0.1;
        for (let i = 0; i < 100; i++) {
            let npv = 0;
            let dnpv = 0;
            for (let j = 0; j < cashFlows.length; j++) {
                const factor = Math.pow(1 + rate, years[j] || j);
                npv += cashFlows[j] / factor;
                dnpv -= (cashFlows[j] * (years[j] || j)) / (factor * (1 + rate));
            }
            const delta = npv / (dnpv || 0.0001);
            rate -= delta;
            if (Math.abs(delta) < 1e-6)
                break;
        }
        return { irrPct: Math.round(rate * 10000) / 100 };
    }
    downPayment(input) {
        const down = (input.propertyPrice * input.downPaymentPct) / 100;
        const principal = input.propertyPrice - down;
        const monthlyRate = input.interestRatePct / 100 / 12;
        const n = input.loanTermYears * 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - principal;
        return {
            downPayment: down,
            loanAmount: principal,
            emi: Math.round(emi * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
        };
    }
    taxEstimate(countryCode, propertyPrice) {
        const rates = {
            IND: { stamp: 5, reg: 1, gst: 1 },
            UAE: { stamp: 4, reg: 0.25 },
            USA: { stamp: 1.5, reg: 0.5 },
        };
        const r = rates[countryCode] || { stamp: 2, reg: 0.5 };
        const stamp = (propertyPrice * r.stamp) / 100;
        const reg = (propertyPrice * r.reg) / 100;
        const gst = r.gst ? (propertyPrice * r.gst) / 100 : 0;
        return {
            stampDuty: Math.round(stamp * 100) / 100,
            registration: Math.round(reg * 100) / 100,
            gst: Math.round(gst * 100) / 100,
            total: Math.round((stamp + reg + gst) * 100) / 100,
        };
    }
};
exports.CalculatorService = CalculatorService;
exports.CalculatorService = CalculatorService = __decorate([
    (0, common_1.Injectable)()
], CalculatorService);
//# sourceMappingURL=calculator.service.js.map