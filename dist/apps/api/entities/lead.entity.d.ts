import { PropertyEntity } from './property.entity';
import { UserEntity } from './user.entity';
export declare class LeadEntity {
    id: string;
    propertyId: string | null;
    property?: PropertyEntity;
    userId: string | null;
    user?: UserEntity;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    createdAt: Date;
}
