import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripe: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(AuthGuard('jwt'))
  createSession(
    @Body() body: { productType: string; referenceId?: string; successUrl: string; cancelUrl: string },
    @CurrentUser() user: { id: string },
  ) {
    const productType = body.productType === 'subscription' ? 'subscription' : 'report';
    return this.stripe.createCheckoutSession({
      userId: user.id,
      productType,
      referenceId: body.referenceId,
      successUrl: body.successUrl || 'http://localhost:3002/dashboard',
      cancelUrl: body.cancelUrl || 'http://localhost:3002',
    });
  }

  @Post('webhook')
  webhook(@Req() req: { rawBody?: Buffer; headers: { 'stripe-signature'?: string } }) {
    const sig = req.headers['stripe-signature'];
    return this.stripe.handleWebhook(req.rawBody || Buffer.from(''), sig || '');
  }
}
