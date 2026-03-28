import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
import { Tag } from '../../domain/entities/Tag';
import { Logger } from '@nestjs/common';
const nodes7 = require('nodes7');

export class S7Driver implements IPLCDriver {
  private readonly logger = new Logger(S7Driver.name);
  private conn = new nodes7();
  private connected = false;

  // Parámetros de conexión Siemens por defecto (Slot 2 para S7-300)
  private config = {
    port: 102,
    host: '192.168.0.1', // <--- CAMBIA ESTO POR LA IP DE TU PLC
    rack: 0,
    slot: 2, // S7-300 es Slot 2, S7-1200/1500 es Slot 1 o 0
  };

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log(`Conectando al PLC Siemens en ${this.config.host}...`);
      
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
      // nodes7 usa formato: 'DB10,INT4' o 'DB10,X0.0'
      const s7Address = this.transformAddress(tag.address, tag.type);

      this.conn.readItems([s7Address], (err: any, values: any) => {
        if (err) return reject(err);
        resolve(values[s7Address]);
      });
    });
  }

  async writeTag(tag: Tag, value: number | boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const s7Address = this.transformAddress(tag.address, tag.type);
      this.conn.writeItems([s7Address], [value], (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Ayudante para convertir por ej: DB10.DBD4 -> DB10,REAL4
  private transformAddress(address: string, type: string): string {
    // Siemens estándar: DB10.DBX0.0 -> DB10,X0.0
    // DB10.DBD4 -> DB10,REAL4 o DB10,DINT4
    let formatted = address.replace(/\./g, ',');
    
    if (type === 'REAL') return formatted.replace('DB', 'REAL');
    if (type === 'BOOL') return formatted.replace('DBX', 'X');
    if (type === 'INT') return formatted.replace('DBW', 'INT');
    
    return formatted;
  }
}
