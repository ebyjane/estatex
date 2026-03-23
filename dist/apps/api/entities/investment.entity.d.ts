import { UserEntity } from './user.entity';
import { PropertyEntity } from './property.entity';
export declare class InvestmentEntity {
    id: string;
    userId: string;
    user: UserEntity;
    propertyId: string;
    property: PropertyEntity;
    amount: number;
    currencyCode: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
