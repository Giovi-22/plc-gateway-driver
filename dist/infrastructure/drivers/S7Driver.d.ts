import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
import { Tag } from '../../domain/entities/Tag';
export declare class S7Driver implements IPLCDriver {
    private readonly logger;
    private conn;
    private connected;
    private registeredTags;
    private s7AddressMap;
    private config;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    registerTags(tags: Tag[]): void;
    readAllTags(): Promise<Record<string, number | boolean>>;
    readTag(tag: Tag): Promise<number | boolean>;
    writeTag(tag: Tag, value: number | boolean): Promise<void>;
    isConnected(): boolean;
    private transformAddress;
}
