/**
 * Rotas comuns de armadilhas/bloqueio para uso como honeypot.
 * São caminhos que usuários legítimos tipicamente nunca acessam,
 * tornando-os ideais para detectar scanners e bots.
 */

/**
 * Armadilhas padrão incluídas automaticamente
 * @example
 * import { createHoneypot, DEFAULT_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: DEFAULT_TRAPS });
 */
export const DEFAULT_TRAPS: string[] = [
  "/phpmyadmin",
  "/wp-admin",
  "/admin",
  "/api/v1",
  "/backup",
  "/.env",
  "/.git",
  "/config.json",
  "/.htaccess",
  "/server-status",
  "/actuator/*",
  "/graphql",
  "/swagger/*",
];

/**
 * Armadilhas estendidas para proteção mais agressiva
 * Inclui painéis admin comuns, endpoints de debug e arquivos sensíveis
 * @example
 * import { createHoneypot, EXTENDED_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: EXTENDED_TRAPS });
 */
export const EXTENDED_TRAPS: string[] = [
  ...DEFAULT_TRAPS,
  // Painéis admin comuns
  "/administrator",
  "/admin.php",
  "/admin/",
  "/admin/login",
  "/adminpanel",
  "/backend",
  "/controlpanel",
  "/cpanel",
  "/manager",
  "/webadmin",
  "/admin/*",
  
  // CMS específicos
  "/wp-login.php",
  "/wp-admin/",
  "/xmlrpc.php",
  "/joomla/administrator",
  "/drupal/user/login",
  "/typo3/",
  "/magento/admin",
  
  // Admin de banco de dados
  "/phpmyadmin/",
  "/pma/",
  "/mysqladmin",
  "/sqladmin",
  "/dbadmin",
  "/adminer.php",
  "/adminer/",
  
  // API / Endpoints de debug
  "/api/*",
  "/api/debug",
  "/api/test",
  "/api/v2",
  "/api/v3",
  "/debug",
  "/debug/*",
  "/health",
  "/healthz",
  "/ready",
  "/metrics",
  "/actuator",
  "/actuator/*",
  "/graphql",
  "/graphiql",
  "/playground",
  "/swagger",
  "/swagger/*",
  "/swagger-ui",
  "/swagger-ui/*",
  "/redoc",
  "/openapi",
  "/openapi.json",
  "/docs",
  "/docs/*",
  
  // Arquivos de configuração / ambiente
  "/.env",
  "/.env.*",
  "/.env.local",
  "/.env.production",
  "/.env.development",
  "/.env.staging",
  "/config.json",
  "/config.yml",
  "/config.yaml",
  "/config.php",
  "/config.ini",
  "/settings.json",
  "/settings.yml",
  "/settings.yaml",
  "/.htaccess",
  "/.htpasswd",
  "/web.config",
  "/nginx.conf",
  "/docker-compose.yml",
  "/docker-compose.yaml",
  "/Dockerfile",
  "/dockerfile",
  "/package.json",
  "/package-lock.json",
  "/yarn.lock",
  "/pnpm-lock.yaml",
  "/composer.json",
  "/composer.lock",
  "/Gemfile",
  "/Gemfile.lock",
  "/requirements.txt",
  "/Pipfile",
  "/Pipfile.lock",
  "/poetry.lock",
  "/Cargo.toml",
  "/Cargo.lock",
  "/go.mod",
  "/go.sum",
  
  // Git / VCS
  "/.git",
  "/.git/",
  "/.git/config",
  "/.git/HEAD",
  "/.svn",
  "/.hg",
  "/.bzr",
  
  // Backup / Arquivo
  "/backup",
  "/backups",
  "/backup/*",
  "/dump",
  "/dumps",
  "/dump.sql",
  "/database.sql",
  "/db.sql",
  "/backup.zip",
  "/backup.tar",
  "/backup.tar.gz",
  "/backup.tgz",
  "/site.zip",
  "/site.tar.gz",
  
  // Status do servidor / Monitoramento
  "/server-status",
  "/server-info",
  "/status",
  "/status/*",
  "/monitoring",
  "/monitoring/*",
  "/prometheus",
  "/prometheus/*",
  "/grafana",
  "/grafana/*",
  
  // Well-known / Segurança
  "/.well-known",
  "/.well-known/*",
  "/.well-known/security.txt",
  "/.well-known/change-password",
  "/robots.txt",
  "/humans.txt",
  "/security.txt",
  
  // Caminhos vulneráveis comuns
  "/shell",
  "/shell.php",
  "/cmd.php",
  "/command.php",
  "/exec.php",
  "/eval.php",
  "/system.php",
  "/passthru.php",
  "/proc.php",
  "/rce.php",
  "/webshell",
  "/webshell.php",
  "/c99.php",
  "/r57.php",
  "/wso.php",
  
  // Install / Setup
  "/install",
  "/install.php",
  "/install/*",
  "/setup",
  "/setup.php",
  "/setup/*",
  "/upgrade",
  "/upgrade.php",
  "/update",
  "/update.php",
  
  // Test / Dev
  "/test",
  "/test/*",
  "/testing",
  "/dev",
  "/dev/*",
  "/development",
  "/staging",
  "/stage",
  "/sandbox",
  "/demo",
  "/demo/*",
  "/example",
  "/example/*",
  "/sample",
  "/sample/*",
];

/**
 * Armadilhas mínimas - apenas os caminhos mais escaneados
 * Use para proteção mais leve com menos falsos positivos
 * @example
 * import { createHoneypot, MINIMAL_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: MINIMAL_TRAPS });
 */
export const MINIMAL_TRAPS: string[] = [
  "/phpmyadmin",
  "/wp-admin",
  "/admin",
  "/.env",
  "/.git",
  "/config.json",
  "/backup",
  "/actuator/*",
];

/**
 * Armadilhas específicas para WordPress
 * @example
 * import { createHoneypot, WORDPRESS_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: WORDPRESS_TRAPS });
 */
export const WORDPRESS_TRAPS: string[] = [
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wp-config.php",
  "/wp-content/debug.log",
  "/wp-includes/",
  "/wp-json/wp/v2/users",
  "/wp-json/wp/v2/posts",
  "/wp-cron.php",
  "/readme.html",
  "/license.txt",
];

/**
 * Armadilhas específicas para PHP
 * @example
 * import { createHoneypot, PHP_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: PHP_TRAPS });
 */
export const PHP_TRAPS: string[] = [
  "/phpmyadmin",
  "/pma",
  "/adminer.php",
  "/info.php",
  "/phpinfo.php",
  "/test.php",
  "/shell.php",
  "/cmd.php",
  "/config.php",
  "/configuration.php",
  "/settings.php",
  "/database.php",
  "/db.php",
  "/connect.php",
  "/connection.php",
];

/**
 * Armadilhas específicas para Node.js/Express
 * @example
 * import { createHoneypot, NODE_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: NODE_TRAPS });
 */
export const NODE_TRAPS: string[] = [
  "/package.json",
  "/package-lock.json",
  "/yarn.lock",
  "/pnpm-lock.yaml",
  "/node_modules/",
  "/.env",
  "/config.json",
  "/config.js",
  "/settings.json",
  "/settings.js",
  "/.npmrc",
  "/.nvmrc",
  "/server.js",
  "/app.js",
  "/index.js",
  "/main.js",
];

/**
 * Todos os conjuntos de armadilhas predefinidos para acesso fácil
 * @example
 * import { createHoneypot, TRAP_SETS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: TRAP_SETS.extended });
 */
export const TRAP_SETS = {
  default: DEFAULT_TRAPS,
  minimal: MINIMAL_TRAPS,
  extended: EXTENDED_TRAPS,
  wordpress: WORDPRESS_TRAPS,
  php: PHP_TRAPS,
  node: NODE_TRAPS,
} as const;

export type TrapSetName = keyof typeof TRAP_SETS;