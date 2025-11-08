import { defineConfig } from 'umi';

export default defineConfig({
  publicPath: './',
  hash: true,
  fastRefresh: {},
  nodeModulesTransform: { type: 'none' },
  history: { type: 'hash' },
  routes: [{ path: '/', component: '@/pages/index' }],
});
