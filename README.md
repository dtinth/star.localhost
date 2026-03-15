# *.localhost

A Bun script to manage localhost subdomains.

My setup:

- I run Caddy on `localhost:80` [using Homebrew](https://formulae.brew.sh/formula/caddy)
- I use the [`update.ts`](update.ts) script set up virtual host from `api.localhost`, `web.localhost`, to different services

## Usage

Configure Caddy to load `~/.local/share/star.localhost/Caddyfile`:

```
import /Users/dtinth/.local/share/star.localhost/Caddyfile
```

Create TOML config file `~/.config/star.localhost/config.toml`:

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

Run the script:

```bash
./update.ts
```

The script will:

- Generate `~/.local/share/star.localhost/Caddyfile`
- Run the configured hook

## Config format

- `subdomains.<name>.upstream`: Where to proxy traffic to
- `subdomains.<name>.host`: Control the Host header sent upstream
  - `true` (default): Use the upstream's hostname
  - `false`: Keep the client's Host header
  - `"example.com"`: Use a specific custom string
- `subdomains.<name>.cors`: Enable CORS from all origins
- `hooks.postupdate`: Run this after generating the config (I use it to reload Caddy)

## My setup

I set this alias in my Fish shell, so that I can easily change my config:

```fish
alias --save config_localhost 'vim ~/.config/star.localhost/config.toml && $HOME/ghq/github.com/dtinth/star.localhost/update.ts'
```
