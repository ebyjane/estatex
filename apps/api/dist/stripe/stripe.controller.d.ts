import { StripeService } from './stripe.service';
export declare class StripeController {
    private stripe;
    constructor(stripe: StripeService);
    createSession(body: {
        productType: string;
        referenceId?: string;
        successUrl: string;
        cancelUrl: string;
    }, user: {
        id: string;
    }): Promise<{
        url: string;
        sessionId: string;
    }>;
    webhook(req: {
        rawBody?: Buffer;
        headers: {
            'stripe-signature'?: string;
        };
    }): Promise<{
        received: boolean;
    }>;
}
