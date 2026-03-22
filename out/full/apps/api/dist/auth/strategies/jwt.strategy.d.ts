import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private auth;
    constructor(auth: AuthService, config: ConfigService);
    validate(payload: {
        sub: string;
    }): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export {};
