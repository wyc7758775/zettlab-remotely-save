# Zettlab Sync

Zettlab Sync 是一个仅支持 WebDAV 的 Obsidian 同步插件，用于把笔记库同步到 Zettlab NAS。

它有意保留 NAS 上的 Markdown 明文，以便 Zettlab 可以索引和使用笔记；不包含云盘 provider、OAuth、二维码配对、付费功能或端到端加密。

## 保留的功能

- 固定用户名 `sync` 的 WebDAV Basic 鉴权
- 手动同步、定时同步、可选的保存后同步
- 连接测试：创建并删除一个临时远端文件
- 基础冲突处理：最新优先、较大优先
- 按文件体积或路径正则跳过

## 本地开发与验证

```bash
npm install
npm test
npm run build
```

构建会生成 `main.js`。在一个临时测试 vault 中，把 `main.js`、`manifest.json`、`styles.css` 放到：

```text
<vault>/.obsidian/plugins/zettlab-sync/
```

随后在 Obsidian 的第三方插件里启用 **Zettlab Sync**。自动接入完成前，可展开“手动接入与同步偏好”，填写 WebDAV 地址和 App 密码；用户名 `sync` 与 Basic 鉴权由插件固定。先点“检测连接”，再用一篇测试笔记执行“立即同步”。

## 注意事项

- 第一次同步前先备份 vault。
- WebDAV 凭证存放在 Obsidian 本机的插件数据中，不要提交或分享该文件。
- 自动同步仅在 Obsidian 打开时运行。

## 许可证与来源

本项目采用 Apache-2.0。它保留并修改了 [Remotely Save](https://github.com/remotely-save/remotely-save) 在许可证拆分前的 Apache-2.0 快照 `7ca2d192552819777318d9d521dca45450934b4f`；当前源码树不包含任何 `pro/` 源码及 PolyForm 代码。详见 [NOTICE](./NOTICE) 与 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
