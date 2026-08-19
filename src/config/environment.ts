export type AppMode = 'MOCK' | 'REAL';

export interface EnvironmentConfig {
  mode: AppMode;
  apiBaseUrl: string;
  proxyBaseUrl: string;
  enableLogs: boolean;
}

let currentConfig: EnvironmentConfig = {
  mode: 'MOCK',
  apiBaseUrl: 'http://154.29.76.165:3000',
  proxyBaseUrl: '/api/leiasp/proxy',
  enableLogs: true,
};

export const getEnvironment = (): EnvironmentConfig => currentConfig;

export const setMode = (mode: AppMode) => {
  currentConfig.mode = mode;
  if (currentConfig.enableLogs) {
    console.log(`[Config] Modo de Operação do LeiaSP alterado para: ${mode}`);
  }
};

export const setEnableLogs = (enabled: boolean) => {
  currentConfig.enableLogs = enabled;
};
