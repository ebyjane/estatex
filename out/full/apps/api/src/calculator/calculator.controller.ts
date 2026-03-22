import { Body, Controller, Post } from '@nestjs/common';
import { CalculatorService } from './calculator.service';

@Controller('calculator')
export class CalculatorController {
  constructor(private calc: CalculatorService) {}

  @Post('rent-vs-buy')
  rentVsBuy(@Body() body: Record<string, number>) {
    return this.calc.rentVsBuy({
      propertyPrice: body.propertyPrice || 100000,
      downPaymentPct: body.downPaymentPct || 20,
      loanTermYears: body.loanTermYears || 20,
      interestRatePct: body.interestRatePct || 8,
      monthlyRent: body.monthlyRent || 500,
    });
  }

  @Post('roi')
  roi(@Body() body: { purchasePrice: number; salePrice: number; costs?: number }) {
    return this.calc.roi({
      purchasePrice: body.purchasePrice || 100000,
      salePrice: body.salePrice || 120000,
      costs: body.costs || 0,
    });
  }

  @Post('irr')
  irr(@Body() body: { cashFlows: number[]; years?: number[] }) {
    return this.calc.irr(body.cashFlows || [-100000, 5000, 5000, 55000], body.years || [0, 1, 2, 3]);
  }

  @Post('down-payment')
  downPayment(@Body() body: Record<string, number>) {
    return this.calc.downPayment({
      propertyPrice: body.propertyPrice || 100000,
      downPaymentPct: body.downPaymentPct || 20,
      interestRatePct: body.interestRatePct || 8,
      loanTermYears: body.loanTermYears || 20,
    });
  }

  @Post('tax-estimate')
  taxEstimate(@Body() body: { countryCode: string; propertyPrice: number }) {
    return this.calc.taxEstimate(body.countryCode || 'IND', body.propertyPrice || 100000);
  }
}
