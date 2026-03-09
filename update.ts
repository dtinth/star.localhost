#!/usr/bin/env bun
import { execSync } from "child_process";
import path from "path";

const home = process.env.HOME!;
const configPath = path.join(home, ".config/star.localhost/config.toml");
const outputPath = path.join(home, ".local/share/star.localhost/Caddyfile");

const configContent = await Bun.file(configPath).text();
const config = Bun.TOML.parse(configContent);

const subdomains = config.subdomains || {};
const subdomainEntries = Object.entries(subdomains);

console.log(
  `Found ${subdomainEntries.length} host${subdomainEntries.length !== 1 ? "s" : ""} from ${configPath}`,
);

let caddyfile = "";

for (const [name, subdomain] of subdomainEntries) {
  const upstream = (subdomain as any).upstream;
  const hostConfig = (subdomain as any).host ?? true;
  const corsEnabled = (subdomain as any).cors ?? false;

  // Determine the Host header value
  let hostHeader: string | null = null;
  if (hostConfig === true) {
    // Default: use upstream host:port
    const url = new URL(upstream);
    hostHeader = url.hostname + (url.port ? `:${url.port}` : "");
  } else if (hostConfig !== false && typeof hostConfig === "string") {
    // Custom host string
    hostHeader = hostConfig;
  }
  // else: hostConfig === false, no Host header

  const reverseProxyBlock = hostHeader
    ? `  reverse_proxy ${upstream} {\n    header_up Host ${hostHeader}\n  }`
    : `  reverse_proxy ${upstream}`;

  const corsBlock = corsEnabled
    ? `  @cors_preflight {
    method OPTIONS
  }
  respond @cors_preflight 204
  header {
    Access-Control-Allow-Methods *
    Access-Control-Max-Age 1800
    Access-Control-Allow-Headers *
    Access-Control-Allow-Origin *
  }
`
    : "";

  caddyfile += `http://${name}.localhost {
  @notlocal not remote_ip 127.0.0.1/8 ::1
  respond @notlocal "Access denied" 403
${corsBlock}${reverseProxyBlock}
}

`;
}

await Bun.write(outputPath, caddyfile);
console.log(`Generated ${outputPath}`);

const hooks = config.hooks || {};
if (hooks.postupdate) {
  console.log(`Running hook: ${hooks.postupdate}`);
  execSync(hooks.postupdate, { stdio: "inherit" });
} else {
  console.log(
    "Tip: Add a [hooks] section with 'postupdate' to auto-reload Caddy after updates",
  );
}
