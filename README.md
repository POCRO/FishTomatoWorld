# FishTomatoWorld（共享地图小程序）

这是一个基于微信小程序的共享地图项目，允许用户查看、添加和更新地图标记（markers），并使用云函数存储与检索数据。

![1761619937574](image/README/1761619937574.png)

## 主要特性

- 地图展示与标记（markers）
- 查看标记详情页面（`pages/detail`）
- 首页地图视图（`pages/index`）
- 使用云函数管理标记数据（`cloudfunctions/getMarkers`、`cloudfunctions/updateMarker`）
- 项目基于 TypeScript（小程序端）和 Node.js（云函数）

## 技术栈

- 微信小程序
- TypeScript
- 小程序云函数（Node.js）
- 依赖：`miniprogram-api-typings`

## 项目结构（简要）

```
app.json
app.ts
package.json
project.config.json
project.private.config.json
tsconfig.json
cloudfunctions/
	getMarkers/
		index.js
		package.json
	updateMarker/
		index.js
		package.json
components/
images/
pages/
	detail/
		detail.ts
		detail.wxml
		detail.wxss
	index/
		index.ts
		index.wxml
		index.wxss
utils/
	marker.ts
```

## 本地开发与运行

1. 使用微信开发者工具打开该项目根目录（`d:\Files\code\FishTomatoWorld`）。
2. 如果你使用 TypeScript，需要在微信开发者工具中启用 TypeScript 编译，或在本地用 tsc 预编译（项目中已包含 `tsconfig.json`）。

注意：此项目的小程序端 TypeScript 文件（`.ts`）在打包时会由微信开发者工具或本地构建流程编译为 `.js`。

## 云函数（Cloud Functions）

- `cloudfunctions/getMarkers`：用于读取/查询标记数据。
- `cloudfunctions/updateMarker`：用于添加或更新标记数据。

这些云函数的入口为 `index.js`，可以在各自目录中查看实现并根据需要安装依赖（每个 cloudfunction 目录下有自己的 `package.json`）。

## 安装依赖

项目根 `package.json` 只有开发用的依赖声明（`miniprogram-api-typings`）。如需在本地管理依赖：

```powershell
cd d:\Files\code\FishTomatoWorld
npm install
```

注意：微信小程序的依赖通常是放在云函数或需要的模块中，微信开发者工具会处理小程序端的上传与构建。

## 测试

仓库当前未包含自动化测试脚本。你可以手动在微信开发者工具中预览并调试页面与云函数。

## 贡献

欢迎提交 Issues 或 Pull Requests。简单贡献流程：

1. Fork 仓库并新建分支
2. 实现功能或修复 bug
3. 提交 PR，并在 PR 描述中说明变更与测试方法

## 许可证

项目未在 `package.json` 中指定许可证。若需添加许可证，请在根目录创建 `LICENSE` 文件（例如 MIT）。

---

如果你希望我把 README 翻译成更简短或更详细的版本，或把其中某部分补充具体运行脚本与示例，我可以继续修改。
