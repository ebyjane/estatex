import { FxService } from './fx.service';
export declare class FxController {
    private fx;
    constructor(fx: FxService);
    latest(from?: string, to?: string): Promise<{
        from: string;
        to: string;
        rate: number;
        success?: undefined;
        data?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        data: null;
        from: string;
        to: string;
        rate: number;
        message: string;
    }>;
    convert(amount: string, from?: string, to?: string): Promise<{
        amount: number;
        from: string;
        to: string;
        rate: number;
        converted: number;
    } | {
        success: boolean;
        data: null;
        amount: number;
        from: string;
        to: string;
        rate: number;
        converted: number;
        message: string;
    }>;
}
