import { Tag } from '../entities/Tag';
export interface IPLCDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    registerTags(tags: Tag[]): void;
    readAllTags(): Promise<Record<string, number | boolean>>;
    readTag(tag: Tag): Promise<number | boolean>;
    writeTag(tag: Tag, value: number | boolean): Promise<void>;
    isConnected(): boolean;
}
