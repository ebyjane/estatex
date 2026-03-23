import { PropertyEntity } from './property.entity';
export declare class PropertyImageEntity {
    id: string;
    propertyId: string;
    url: string;
    thumbUrl: string;
    sortOrder: number;
    createdAt: Date;
    property: PropertyEntity;
}
