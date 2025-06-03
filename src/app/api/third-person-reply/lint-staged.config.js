module.exports = {
  '**/*.{js,jsx,ts,tsx}': (files) => {
    return files
      .filter((file) => !file.includes('route.ts'))
      .map((file) => [`eslint --max-warnings=0 ${file}`, `prettier -w ${file}`])
      .flat();
  },
  '**/*.{json,css,scss,md,webmanifest}': ['prettier -w'],
};
