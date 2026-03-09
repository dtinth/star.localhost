# *.localhost

A script to manage local dev domains on my Mac. I run Caddy on localhost and use this to map `api.localhost`, `web.localhost`, etc. to different local services. Just edit a config file and run the script—it generates the Caddyfile and reloads Caddy automatically.

## How I use it

I keep a TOML config in `~/.config/star.localhost/config.toml` describing my local services. Then:

```bash
./update.ts
```

This generates `~/.local/share/star.localhost/Caddyfile` and auto-reloads Caddy if you set up a hook.

My main Caddyfile at `/opt/homebrew/etc/Caddyfile` just imports the generated one:

```
import /Users/dtinth/.local/share/star.localhost/Caddyfile
```

## Config example

```toml
[subdomains.project1]
upstream = "http://localhost:3000"
cors = true

[subdomains.project2]
upstream = "http://localhost:5173"
host = "example.com"

[hooks]
postupdate = "caddy reload --config /opt/homebrew/etc/Caddyfile"
```

- `subdomains.<name>.upstream`: Where to proxy traffic to
- `subdomains.<name>.host`: Control the Host header sent upstream
  - `true` (default): Use the upstream's hostname
  - `false`: Keep the client's Host header
  - `"example.com"`: Use a specific custom string
- `subdomains.<name>.cors`: Enable CORS from all origins
- `hooks.postupdate`: Run this after generating the config (I use it to reload Caddy)
