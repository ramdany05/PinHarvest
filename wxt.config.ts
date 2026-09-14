import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'PinHarvest',
    description: 'Harvest map listings into structured CSV/JSON leads — visual picker + auto-scroll',
    version: '1.0.0',
    permissions: ['storage', 'activeTab', 'scripting'],
  },
  vite: () => ({
    build: {
      target: 'es2022',
    },
  }),
});
