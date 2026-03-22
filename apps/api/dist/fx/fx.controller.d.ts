import { FxService } from './fx.service';
export declare class FxController {
    private fx;
    constructor(fx: FxService);
    latest(from?: string, to?: string): Promise<{
        from: string;
        to: string;
        rate: number;
    }>;
    convert(amount: string, from?: string, to?: string): Promise<{
        amount: number;
        from: string;
        to: string;
        rate: number;
        converted: number;
    }>;
}
