/**
 * Smoke test do consumo por BUNDLER (Vue / React / Vite / webpack).
 *
 * Importa exatamente os mesmos arquivos que o `exports` do package.json resolve
 * para `@wrrdev/fenix-ui/icon`, `/input`, `/button`, `/pagination` e `/icons` —
 * sem UMD nenhum. O que este teste precisa provar: o bundler do CONSUMIDOR copia
 * a fonte (`new URL('../assets/fenix-icons-*.woff2', import.meta.url)`) e o CSS
 * sai com uma URL que resolve no bundle final. Se este build passar e o
 * `consumer-smoke-dist/assets` tiver o `.woff2`, o caminho "instalado" não
 * regrediu.
 *
 * Rode com: npm run test:consumer
 */
import '../../dist/components/icon/index.js';
import '../../dist/components/input/index.js';
import '../../dist/components/button/index.js';
import '../../dist/components/pagination/index.js';
import '../../dist/icons/index.js';
