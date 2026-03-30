import { Tag } from '../entities/Tag';

export interface IPLCDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Batch processing methods (High Performance)
  registerTags(tags: Tag[]): void;
  readAllTags(): Promise<Record<string, number | boolean>>;
  
  // Single processing methods (Legacy / Ad-hoc)
  readTag(tag: Tag): Promise<number | boolean>;
  writeTag(tag: Tag, value: number | boolean): Promise<void>;
  
  isConnected(): boolean;
}
