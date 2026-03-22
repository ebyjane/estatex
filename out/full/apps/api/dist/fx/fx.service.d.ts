export declare class FxService {
    getRate(from: string, to: string): Promise<number>;
    convert(amount: number, from: string, to: string): Promise<{
        amount: number;
        from: string;
        to: string;
        rate: number;
        converted: number;
    }>;
}
