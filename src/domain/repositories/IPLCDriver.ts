import { Tag } from '../entities/Tag';

export interface IPLCDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  readTag(tag: Tag): Promise<number | boolean>;
  writeTag(tag: Tag, value: number | boolean): Promise<void>;
  isConnected(): boolean;
}
