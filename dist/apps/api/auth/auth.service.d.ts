import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
export declare class AuthService {
    private userRepo;
    private jwtService;
    constructor(userRepo: Repository<UserEntity>, jwtService: JwtService);
    private ensureDefaultAdminUser;
    private isPostgresUniqueViolation;
    register(dto: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        investorType?: string;
        preferredCurrency?: string;
    }): Promise<{
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
    login(email: string, password: string): Promise<{
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
    validateUser(id: string): Promise<UserEntity | null>;
    private loginResponse;
    sanitize(user: UserEntity): {
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
}
