import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.routineo.app',
  appName: 'Routineo',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      showSpinner: true,
      spinnerColor: '#999999',
      backgroundColor: '#ffffff',
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerType: 'circular',
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      splashFullScreen: true,
      splashImmersive: true
    },
    CapacitorHttp: { enabled: true }
  },
  server: { androidScheme: 'https' }
};

export default config;
