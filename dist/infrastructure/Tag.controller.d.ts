import { TagManagerService } from '../application/TagManager.service';
export declare class TagController {
    private readonly tagManager;
    constructor(tagManager: TagManagerService);
    getAll(): {
        id: string;
        state: any;
    }[];
    create(data: any): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    request(id: string): Promise<{
        success: boolean;
    }>;
    approve(id: string, role: 'PROD' | 'SUPER'): Promise<{
        success: boolean;
    }>;
    cancel(id: string): Promise<{
        success: boolean;
    }>;
    command(id: string, signal: string, value: any): Promise<{
        success: boolean;
    }>;
}
