// primera alternativa para leer .json en ESmodules (experimental):
// import movies from './movies.json' with { type: 'json' };

// segunda alternativa para leer .json:
// import fs from 'node:fs';
// const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'));
// modo recomendado para leer .json en ESmodules:
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export const readJson = (file) => require(file);
