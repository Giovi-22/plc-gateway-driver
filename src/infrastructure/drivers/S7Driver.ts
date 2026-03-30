import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
import { Tag } from '../../domain/entities/Tag';
import { Logger } from '@nestjs/common';
const nodes7 = require('nodes7');

export class S7Driver implements IPLCDriver {
  private readonly logger = new Logger(S7Driver.name);
  private conn = new nodes7();
  private connected = false;

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

  async readTag(tag: Tag): Promise<number | boolean> {
    if (!this.connected) throw new Error('🔌 Driver no conectado al PLC.');

    return new Promise((resolve, reject) => {
      // Traducir dirección para nodes7
      const s7Address = this.transformAddress(tag.address, tag.type);

      // nodes7 requiere añadir el item antes de leerlo todo
      this.conn.addItems(s7Address);
      
      this.conn.readAllItems((err: any, values: any) => {
        if (err) {
          this.logger.error(`Error leyendo ${tag.id} (${s7Address}): ${err}`);
          return reject(err);
        }
        
        // Limpiamos el item después de leerlo si no queremos mantenerlo en el pool fijo
        this.conn.removeItems(s7Address);
        
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
