import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
import { Tag } from '../../domain/entities/Tag';
import { Logger } from '@nestjs/common';
const nodes7 = require('nodes7');

export class S7Driver implements IPLCDriver {
  private readonly logger = new Logger(S7Driver.name);
  private conn = new nodes7();
  private connected = false;

  private registeredTags = new Map<string, Tag>();
  private s7AddressMap = new Map<string, string>();

  // Parámetros de conexión Siemens leídos de .env
  private config = {
    port: 102,
    host: process.env.PLC_HOST || '192.168.0.1',
    rack: Number(process.env.PLC_RACK) || 0,
    slot: Number(process.env.PLC_SLOT) || 2,
  };

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log(`Conectando al PLC Siemens en ${this.config.host} (Rack ${this.config.rack}, Slot ${this.config.slot})...`);
      
      this.conn.initiateConnection(this.config, (err: any) => {
        if (err) {
          this.logger.error(`❌ Error de conexión: ${err}`);
          return reject(err);
        }
        this.connected = true;
        this.logger.log('✅ Conexión establecida con el PLC REAL.');
        resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.conn.dropConnection(() => {
        this.connected = false;
        resolve();
      });
    });
  }

  registerTags(tags: Tag[]): void {
    const toAdd: string[] = [];
    
    for (const tag of tags) {
      if (!this.registeredTags.has(tag.id)) {
        const s7Addr = this.transformAddress(tag.address, tag.type);
        this.registeredTags.set(tag.id, tag);
        this.s7AddressMap.set(tag.id, s7Addr);
        toAdd.push(s7Addr);
      }
    }
    
    if (toAdd.length > 0) {
      this.conn.addItems(toAdd);
      this.logger.log(`📥 Registradas ${toAdd.length} etiquetas variables en la piscina de Nodes7.`);
    }
  }

  async readAllTags(): Promise<Record<string, number | boolean>> {
    if (!this.connected || this.registeredTags.size === 0) return {};

    return new Promise((resolve, reject) => {
      this.conn.readAllItems((err: any, values: any) => {
        if (err) {
           this.logger.error(`Error de red al leer lote: ${err}`);
           return resolve({}); // Retorna vacío pero no estalla Node
        }
        
        const result: Record<string, number | boolean> = {};
        for (const [tagId, s7Addr] of this.s7AddressMap.entries()) {
           if (values[s7Addr] !== undefined) {
             result[tagId] = values[s7Addr];
           }
        }
        resolve(result);
      });
    });
  }

  async readTag(tag: Tag): Promise<number | boolean> {
    if (!this.connected) throw new Error('🔌 Driver no conectado al PLC.');

    // 🌟 FALLBACK: Si no existe, lo agregamos permanentemente
    if (!this.registeredTags.has(tag.id)) {
       this.registerTags([tag]);
    }

    return new Promise((resolve, reject) => {
      const s7Address = this.s7AddressMap.get(tag.id)!;
      this.conn.readAllItems((err: any, values: any) => {
        if (err) return reject(err);
        resolve(values[s7Address]);
      });
    });
  }

  async writeTag(tag: Tag, value: number | boolean): Promise<void> {
    if (!this.connected) throw new Error('🔌 Driver no conectado al PLC.');

    return new Promise((resolve, reject) => {
      const s7Address = this.transformAddress(tag.address, tag.type);
      this.conn.writeItems([s7Address], [value], (err: any) => {
        if (err) {
          this.logger.error(`Error escribiendo ${tag.id} (${s7Address}): ${err}`);
          return reject(err);
        }
        resolve();
      });
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Transforma direcciones estándar (DB8.DBD0) al formato de nodes7 (DB8,REAL0)
   */
  private transformAddress(address: string, type: string): string {
    // 1. Separar DB del resto (e.g., DB8.DBD0 -> [DB8, DBD0])
    const parts = address.split('.');
    if (parts.length < 2) return address;

    const db = parts[0]; // DB8
    const offsetPart = parts[1]; // DBD0, DBW2, DBX0, etc.

    // 2. Extraer el offset numérico (e.g., DBD4 -> 4, DBX0.0 -> 0.0)
    const match = offsetPart.match(/\d+(\.\d+)?/);
    const offset = match ? match[0] : offsetPart;

    // 3. Formatear según tipo para nodes7
    // BOOL: DB8,X0.0
    // REAL: DB8,REAL0
    // INT:  DB8,INT0
    switch (type) {
      case 'BOOL':
        return `${db},X${offset}`;
      case 'REAL':
        return `${db},REAL${offset}`;
      case 'INT':
        return `${db},INT${offset}`;
      default:
        return `${db},${offset}`;
    }
  }
}
