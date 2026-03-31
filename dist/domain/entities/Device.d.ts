import { SignalTemplate } from './DeviceTemplate';
import { Tag } from './Tag';
export declare class Device {
    readonly id: string;
    readonly db: number;
    readonly baseOffset: number;
    private readonly template;
    readonly commandDb?: number | undefined;
    readonly commandOffset?: number | undefined;
    readonly tags: Tag[];
    constructor(id: string, db: number, baseOffset: number, template: SignalTemplate[], commandDb?: number | undefined, commandOffset?: number | undefined);
    private generateTags;
    private calculateAddress;
    getTags(): Tag[];
}
