# Zettlab Sync

Zettlab Sync is a WebDAV-only Obsidian plugin for syncing a vault with a Zettlab NAS.

It deliberately keeps Markdown plaintext on the NAS so Zettlab can index and use the notes. It does not include cloud providers, OAuth, QR pairing, a paid tier, or end-to-end encryption.

## What it does

- WebDAV Basic or Digest authentication
- Manual sync, periodic sync, and optional sync after a note is saved
- Connection test that creates and removes a temporary remote file
- Basic conflict choices: keep newer or keep larger
- File-size and path-pattern exclusions

## Local development

```bash
npm install
npm test
npm run build
```

The build creates `main.js`. To test it in a disposable vault, copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/zettlab-sync/
```

Then enable **Zettlab Sync** in Obsidian community plugins, set the WebDAV address and credentials, click **Test**, and use **Sync now** with a disposable note first.

## Safety

- Back up a vault before first sync.
- WebDAV credentials are stored in Obsidian's local plugin data. Do not commit or share that file.
- Automatic sync only runs while Obsidian is open.

## License and provenance

This project is Apache-2.0. It retains and modifies Apache-2.0 code from the pre-license-split [Remotely Save](https://github.com/remotely-save/remotely-save) snapshot `7ca2d192552819777318d9d521dca45450934b4f`; all `pro/` source and PolyForm-licensed code are excluded from the current source tree. See [NOTICE](./NOTICE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
