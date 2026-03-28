import { IPLCDriver } from '../../domain/repositories/IPLCDriver';
export declare const PLCDriverFactory: {
    provide: string;
    useFactory: () => IPLCDriver;
};
