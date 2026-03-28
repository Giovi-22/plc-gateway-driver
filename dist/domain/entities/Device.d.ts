import { SignalTemplate } from './DeviceTemplate';
import { Tag } from './Tag';
export declare class Device {
    readonly id: string;
    readonly db: number;
    readonly baseOffset: number;
    private readonly template;
    readonly tags: Tag[];
    constructor(id: string, db: number, baseOffset: number, template: SignalTemplate[]);
    private generateTags;
    private calculateAddress;
    getTags(): Tag[];
}
