import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
import { Tag } from '../../domain/entities/Tag';
export declare class S7Driver implements IPLCDriver {
    private readonly logger;
    private conn;
    private connected;
    private config;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    readTag(tag: Tag): Promise<number | boolean>;
    writeTag(tag: Tag, value: number | boolean): Promise<void>;
    isConnected(): boolean;
    private transformAddress;
}
