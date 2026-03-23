export declare class StripeService {
    createCheckoutSession(params: {
        userId: string;
        productType: 'report' | 'subscription';
        priceId?: string;
        amountCents?: number;
        referenceId?: string;
        successUrl: string;
        cancelUrl: string;
    }): Promise<{
        url: string;
        sessionId: string;
    }>;
    createCustomerPortalSession(customerId: string, returnUrl: string): Promise<{
        url: string;
    }>;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
}
