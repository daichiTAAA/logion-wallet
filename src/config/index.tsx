import { RegistryTypes } from '@polkadot/types/types/registry';

export interface ConfigType {
    APP_NAME: string,
    PROVIDER_SOCKET: string,
    DEVELOPMENT_KEYRING: boolean,
    RPC: object,
    types: RegistryTypes,
}

export const DEFAULT_CONFIG: ConfigType = {
    APP_NAME: "Logion Wallet",
    PROVIDER_SOCKET: "",
    DEVELOPMENT_KEYRING: true,
    RPC: {
        
    },
    types: {
        Address: "MultiAddress",
        LookupSource: "MultiAddress",
        PeerId: "(Vec<u8>)"
    }
};

export interface EnvConfigType extends Record<string, any> {

}

const configEnv: EnvConfigType = require(`./${process.env.NODE_ENV}.json`);

// Accepting React env vars and aggregating them into `config` object.
const envVarNames: string[] = [
  'REACT_APP_PROVIDER_SOCKET',
  'REACT_APP_DEVELOPMENT_KEYRING'
];
const envVars: EnvConfigType = envVarNames.reduce<EnvConfigType>((mem, n) => {
    if (process.env[n] !== undefined) {
        mem[n.slice(10)] = process.env[n];
    }
    return mem;
}, {});

const config: ConfigType = { ...DEFAULT_CONFIG, ...configEnv, ...envVars };
export default config;
