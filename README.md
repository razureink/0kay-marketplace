# 0KAY Marketplace

A plugin marketplace for the 0KAY platform. It lists every GitHub repository
tagged with the **`0kay-plugin`** topic, shows its `manifest.json`
identity/version, and gives a one-line install command.

This is a **UI-only plugin**: a native 0KAY page (`plugin-web/marketplace`) plus
a Core UI patch. It has no background service.

## Install

```sh
npm install -g ./pm            # if the CLI is not installed yet
0kay-pm install @razureink/0kay-marketplace
```

`0kay-pm` resolves `@razureink/0kay-marketplace` to this repository, runs
`npm install` in `plugin-web/marketplace`, builds the ESM bundle, publishes it to
`core/data/plugin-ui/marketplace/`, and copies `core/data/ui/marketplace.patch`
into Core's `data/ui/`. Core picks the patch up (3 s rescan; the WebUI polls
every 15 s) and a **插件市场 / Marketplace** entry appears in the navigation.

You can also install straight from the repository:

```sh
0kay-pm install razureink/0kay-marketplace
```

## Publish a plugin to the market

Add the GitHub repository topic `0kay-plugin` to the repo
(**Settings → Topics**). Nothing in `manifest.json` is used for discovery.

## Development

```sh
cd plugin-web/marketplace
npm install
npm run build          # → dist/index.js
```

The bundle imports `vue` as an external module; the WebUI importmap maps it to
the host bridge (`window.__0KAY_VUE__`). Do not import `vue-router`, pinia or
other host-private packages.

## License

MIT © 2026 razureink
