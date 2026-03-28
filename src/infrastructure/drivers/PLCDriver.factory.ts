import { S7Driver } from './S7Driver';
import { SimulatedDriver } from './SimulatedDriver';
import { IPLCDriver } from '../../domain/repositories/IPLCDriver';

export const PLCDriverFactory = {
  provide: 'PLC_DRIVER', // Token único para inyección
  useFactory: (): IPLCDriver => {
    // Aquí podrías leer de un archivo .env
    const useRealPLC = process.env.USE_REAL_PLC === 'true';

    if (useRealPLC) {
      return new S7Driver();
    }
    
    return new SimulatedDriver();
  },
};
