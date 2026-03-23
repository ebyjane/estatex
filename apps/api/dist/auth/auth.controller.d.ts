import { AuthService } from './auth.service';
declare class RegisterDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    investorType?: string;
    preferredCurrency?: string;
}
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            countryId: string;
            investorType: string;
            preferredCurrency: string;
            role: string;
            accountStatus: string;
            avatarUrl: string;
            oauthProvider: string;
            oauthId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        expiresIn: number;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            countryId: string;
            investorType: string;
            preferredCurrency: string;
            role: string;
            accountStatus: string;
            avatarUrl: string;
            oauthProvider: string;
            oauthId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        expiresIn: number;
    } | {
        success: boolean;
        data: null;
        message: string;
        accessToken: null;
        user: null;
    }>;
    me(user: {
        id: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        countryId: string;
        investorType: string;
        preferredCurrency: string;
        role: string;
        accountStatus: string;
        avatarUrl: string;
        oauthProvider: string;
        oauthId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
export {};
