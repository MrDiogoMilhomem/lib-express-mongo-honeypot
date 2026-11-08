# express-mongo-honeypot

Middleware Express que configura armadilhas honeypot para detectar e bloquear automaticamente scanners, bots e atores maliciosos. Usa MongoDB para armazenamento persistente da blocklist.

## Recursos

- Honeypot traps - Caminhos configuraveis que usuarios legitimos nunca acessam
- Bloqueio automatico - IPs que acessam armadilhas sao adicionados automaticamente a blocklist no MongoDB
- Atualizacao automatica - Blocklist atualizada a cada 30s (configuravel)
- Padroes glob - Suporte a caminhos com wildcard como `/actuator/*`
- Extensivel - Armazenamento de blocklist, logger, deteccao de IP personalizaveis
- Padroes inteligentes - Nao bloqueia IPs internos/privados (configuravel)
- Tipado - Suporte completo a TypeScript
- Conjuntos de armadilhas predefinidos - Colecoes prontas para cenarios comuns

## Instalacao

```bash
npm install express-mongo-honeypot mongodb
```

Dependencias peer: `express` e `mongodb` (v6+)

## Inicio Rapido

```typescript
import express from "express";
import { createHoneypot, createMongoBlocklist } from "express-mongo-honeypot";

const app = express();

// Habilita trust proxy se estiver atras de nginx/load balancer
app.set("trust proxy", true);

// Cria blocklist MongoDB
const blocklist = createMongoBlocklist({
  url: "mongodb://localhost:27017",
  database: "myapp",
});

// Cria middleware honeypot
const honeypot = createHoneypot({
  blocklist,
  trapsFile: "./honeypot-traps.json", // armadilhas customizadas opcionais
});

// Usa globalmente ou em rotas especificas
app.use(honeypot);

app.get("/", (req, res) => res.send("Ola!"));

app.listen(3000);
```

## Configuracao

### `HoneypotOptions`

| Opcao | Tipo | Padrao | Descricao |
|-------|------|--------|-----------|
| `traps` | `string[]` | `[]` | Caminhos adicionais de armadilha (mesclados com padroes) |
| `trapsFile` | `string` | - | Caminho para arquivo JSON com armadilhas customizadas |
| `blocklist` | `BlocklistStorage` | **obrigatorio** | Implementacao de armazenamento da blocklist |
| `logger` | `HoneypotLogger \| false` | `console` | Implementacao do logger, ou `false` para desabilitar |
| `getIp` | `(req) => string` | `req.ip` | Extrator de IP customizado |
| `internalNetworks` | `BlockList \| false \| undefined` | Redes privadas padrao | Redes internas que nunca devem ser bloqueadas |
| `onTriggered` | `(req, res, trap, ip) => void` | 404 + bloqueio | Handler customizado quando armadilha e acionada |
| `autoLoadTraps` | `boolean` | `true` | Carrega armadilhas do arquivo na inicializacao |

### Armadilhas Padrao

```json
[
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
  "/swagger/*"
]
```

### Arquivo de Armadilhas Customizadas

Crie `honeypot-traps.json`:
```json
[
  "/meu-admin-secreto",
  "/api/interno/*",
  "/.well-known/segredo"
]
```

## Blocklist MongoDB

```typescript
const blocklist = createMongoBlocklist({
  url: "mongodb://usuario:senha@localhost:27017",
  database: "myapp",
  collectionName: "BlockedIPs",     // opcional
  updateIntervalMs: 30000,          // opcional (30s padrao)
  logger: false,                    // opcional - desabilita logs da blocklist
});
```

### Interface da Blocklist

Implemente seu proprio armazenamento (Redis, arquivo, memoria, etc.):

```typescript
interface BlocklistStorage {
  init(): Promise<void>;
  isBlocked(ip: string): boolean;
  block(ip: string, reason: string): Promise<void>;
  unblock?(ip: string): Promise<void>;
  getAll?(): Promise<string[]>;
  close?(): Promise<void>;
}
```

## Conjuntos de Armadilhas Predefinidos (Routes)

Importe colecoes prontas de `express-mongo-honeypot/routes`:

```typescript
import { createHoneypot, createMongoBlocklist, TRAP_SETS, MINIMAL_TRAPS, EXTENDED_TRAPS } from "express-mongo-honeypot";

const blocklist = createMongoBlocklist({ url: "mongodb://localhost:27017", database: "myapp" });

// Use conjuntos predefinidos
const honeypot = createHoneypot({ blocklist, traps: TRAP_SETS.extended });

// Ou colecoes especificas
const honeypot = createHoneypot({ blocklist, traps: MINIMAL_TRAPS });
const honeypot = createHoneypot({ blocklist, traps: EXTENDED_TRAPS });
const honeypot = createHoneypot({ blocklist, traps: WORDPRESS_TRAPS });
const honeypot = createHoneypot({ blocklist, traps: PHP_TRAPS });
const honeypot = createHoneypot({ blocklist, traps: NODE_TRAPS });
```

### Conjuntos Disponiveis

| Conjunto | Descricao | Caminhos |
|----------|-----------|----------|
| `DEFAULT_TRAPS` | Protecao basica (padrao) | 13 caminhos |
| `MINIMAL_TRAPS` | Protecao leve, menos falsos positivos | 8 caminhos |
| `EXTENDED_TRAPS` | Protecao agressiva | 80+ caminhos |
| `WORDPRESS_TRAPS` | Especifico para WordPress | 10 caminhos |
| `PHP_TRAPS` | Especifico para aplicacoes PHP | 16 caminhos |
| `NODE_TRAPS` | Especifico para Node.js/Express | 14 caminhos |

### Configuracao Customizada de Armadilhas

```typescript
import { createHoneypot, EXTENDED_TRAPS } from "express-mongo-honeypot";

// Estenda com seus proprios caminhos
const honeypot = createHoneypot({
  blocklist,
  traps: [
    ...EXTENDED_TRAPS,
    "/meu-admin-customizado",
    "/api/interno/*",
    "/secreto/*",
  ],
});

// Ou substitua completamente
const honeypot = createHoneypot({
  blocklist,
  traps: ["/admin", "/secreto", "/interno/*"], // apenas estes
});
```

## Logger Customizado

```typescript
import { createHoneypot, createConsoleLogger, debugLogger, productionLogger } from "express-mongo-honeypot";
import winston from "winston";

// Use loggers embutidos
const honeypot = createHoneypot({ blocklist, logger: debugLogger });        // nivel debug
const honeypot = createHoneypot({ blocklist, logger: productionLogger });   // nivel warn, sem cores

// Logger customizado com opcoes
const honeypot = createHoneypot({
  blocklist,
  logger: createConsoleLogger({ service: "api" }, { minLevel: "debug", color: true }),
});

// Integracao com Winston
const winstonLogger = winston.createLogger({ /* ... */ });
const honeypot = createHoneypot({
  blocklist,
  logger: {
    debug: (msg, meta) => winstonLogger.debug(msg, meta),
    info: (msg, meta) => winstonLogger.info(msg, meta),
    warn: (msg, meta) => winstonLogger.warn(msg, meta),
    error: (msg, meta) => winstonLogger.error(msg, meta),
    child: (meta) => winstonLogger.child(meta),
  },
});

// Desabilitar logs completamente
const honeypot = createHoneypot({ blocklist, logger: false });
```

## Configuracao de Redes Internas

Por padrao, estes ranges nunca sao bloqueados:
- `127.0.0.0/8` (localhost)
- `10.0.0.0/8` (privado)
- `172.16.0.0/12` (privado)
- `192.168.0.0/16` (privado)
- `169.254.0.0/16` (link-local)
- `::1` (IPv6 localhost)
- `fc00::/7` (IPv6 privado)
- `fe80::/10` (IPv6 link-local)

### Personalizar Redes Internas

```typescript
import { createHoneypot, createMongoBlocklist } from "express-mongo-honeypot";
import { BlockList } from "node:net";

const blocklist = createMongoBlocklist({ url: "mongodb://localhost:27017", database: "myapp" });

// Use redes internas customizadas
const redesCustomizadas = new BlockList();
redesCustomizadas.addSubnet("10.0.0.0", 8, "ipv4");
redesCustomizadas.addSubnet("192.168.0.0", 16, "ipv4");

const honeypot = createHoneypot({
  blocklist,
  internalNetworks: redesCustomizadas,
});

// Desabilite verificacao de redes internas completamente (bloqueie TODOS os IPs que acessarem armadilhas)
const honeypot = createHoneypot({
  blocklist,
  internalNetworks: false,
});

// Use padroes (omita a opcao completamente)
const honeypot = createHoneypot({ blocklist });
```

## Extrator de IP Customizado

```typescript
const honeypot = createHoneypot({
  blocklist,
  getIp: (req) => req.headers["x-real-ip"] as string || req.ip,
});
```

## Handler Customizado de Gatilho

```typescript
const honeypot = createHoneypot({
  blocklist,
  onTriggered: async (req, res, trap, ip) => {
    // Envie para SIEM, alerte, etc.
    await enviarAlerta({ ip, trap, ua: req.headers["user-agent"] });
    
    // Retorne resposta customizada
    res.status(404).json({ error: "Nao encontrado" });
  },
});
```

## Verificar se IP esta Bloqueado (em suas rotas)

```typescript
app.use(async (req, res, next) => {
  const ip = req.ip;
  if (await blocklist.isBlocked(ip)) {
    return res.status(403).json({ error: "Proibido" });
  }
  next();
});
```

## Bloqueio/Desbloqueio Programatico

```typescript
// Bloqueie um IP manualmente
await blocklist.block("192.168.1.100", "Bloqueio manual: atividade suspeita");

// Desbloqueie um IP
await blocklist.unblock("192.168.1.100");

// Obtenha todos os IPs bloqueados
const bloqueados = await blocklist.getAll();
```

## Encerramento Gracioso

```typescript
process.on("SIGTERM", async () => {
  await blocklist.close();
  process.exit(0);
});
```

## Como Funciona

1. **Requisicao chega** -> Middleware verifica caminho contra padroes de armadilha
2. **Correspondencia encontrada** -> IP e extraido e verificado contra lista de nao-bloqueaveis
3. **Nao e IP interno** -> IP e adicionado a blocklist MongoDB com motivo
4. **Resposta** -> Retorna 404 (customizavel)
5. **Requisicoes futuras** -> Middleware de blocklist verifica `isBlocked()` e retorna 403

## IPs Internos (Nunca Bloqueados por Padrao)

Por padrao, estes ranges nunca sao bloqueados:
- `127.0.0.0/8` (localhost)
- `10.0.0.0/8` (privado)
- `172.16.0.0/12` (privado)
- `192.168.0.0/16` (privado)
- `169.254.0.0/16` (link-local)
- `::1` (IPv6 localhost)
- `fc00::/7` (IPv6 privado)
- `fe80::/10` (IPv6 link-local)

## Licenca
Este projeto é open-source e distribuído sob os termos da [GPL-2.0](LICENSE).