import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
import { Tag } from '../../domain/entities/Tag';
import { Logger } from '@nestjs/common';

export class SimulatedDriver implements IPLCDriver {
  private readonly logger = new Logger(SimulatedDriver.name);
  private connected = false;

  private registeredTags = new Map<string, Tag>();

  async connect(): Promise<void> {
    this.logger.log('Conectando al PLC Simulado...');
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        this.logger.log('✅ Conexión establecida con simulador.');
        resolve();
      }, 500);
    });
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Desconectado del simulador.');
  }

  registerTags(tags: Tag[]): void {
    tags.forEach(tag => this.registeredTags.set(tag.id, tag));
    this.logger.log(`📥 [Sim] Registradas ${tags.length} etiquetas.`);
  }

  async readAllTags(): Promise<Record<string, number | boolean>> {
    const result: Record<string, number | boolean> = {};
    for (const tag of this.registeredTags.values()) {
      result[tag.id] = await this.readTag(tag);
    }
    return result;
  }

  async readTag(tag: Tag): Promise<number | boolean> {
    if (!this.connected) throw new Error('Driver no conectado.');

    // Simulación: Generar valores aleatorios coherentes según el tipo
    if (tag.type === 'BOOL') {
      return Math.random() > 0.5;
    }

    if (tag.type === 'REAL' || tag.type === 'INT') {
      // Si tiene escalado, generamos un valor raw dentro de ese rango
      if (tag.scaling) {
        const { minRaw, maxRaw } = tag.scaling;
        return Math.floor(Math.random() * (maxRaw - minRaw + 1)) + minRaw;
      }
      return Math.random() * 1000;
    }

    return 0;
  }

  async writeTag(tag: Tag, value: number | boolean): Promise<void> {
    this.logger.log(`Escritura simulada en ${tag.address}: ${value}`);
  }

  isConnected(): boolean {
    return this.connected;
  }
}
