// Phone dev server launcher (CommonJS for PowerShell compat)
// Run with: node start-phone.cjs

(async () => {
  // Dynamic import works with ESM-only packages from CJS context
  const [viteModule, tailwindModule] = await Promise.all([
    import('vite'),
    import('@tailwindcss/vite'),
  ]);
  const path = await import('path');

  const server = await viteModule.createServer({
    plugins: [tailwindModule.default()],
    resolve: {
      alias: {
        '@': path.default.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false, // HMR double-transform bug on Windows — disable for stable phone preview
      watch: null,
    },
  });
  await server.listen();
  server.printUrls();
})();
