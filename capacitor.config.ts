import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plancraft.ai',
  appName: 'PlanCraftAI',
  webDir: 'out',
  server: {
    // In development, point to local network server for hot reload.
    // Remove this block for a production APK (uses bundled assets).
    url: 'http://192.168.0.157:3000',
    cleartext: true,
  },
  android: {
    initialFocus: true,
  },
};

export default config;
