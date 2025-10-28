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


## 路线图 / 未来计划

下面是我建议的优先级与简要实现说明（可以作为后续任务分工）:

1. 整体美化 UI（优先级：高）
	- 目标：改进标点（marker）展示样式、字体、配色、间距，统一控件风格并提升移动端视觉体验。
	- 验收标准：界面使用统一主题，搜索/列表/详情页面在常见手机分辨率下无布局错位，交互流畅。

2. 分类与收藏（优先级：高）
	- 目标：为标记添加分类（tags）和收藏（favorite）字段，支持按分类过滤和收藏列表视图。
	- 验收标准：用户可以为标记设置一个或多个分类、标记为收藏；列表可以按分类或收藏筛选并持久化设置。

3. 多人协作（优先级：中）
	- 目标：实现共享/协作功能（例如：共享地图、邀请协作者、权限控制（只读/可编辑）），并记录变更历史。
	- 验收标准：用户 A 可以邀请用户 B 访问/编辑某地图集合；权限生效且修改能被相关协作者看到（示例为同步或刷新可见）。

4. 云端与本地双保险（优先级：高）
	- 目标：实现双向同步机制（本地缓存 + 云端），支持离线编辑、冲突检测与合并，确保不会在网络断开时丢失用户数据。
	- 验收标准：离线时新增/编辑的标记保存在本地，网络恢复后自动同步到云端并处理冲突（按时间戳或用户选择合并）。

5. UX 增强与生产化准备（优先级：中）
	- 目标：添加图片上传（云存储）、位置精确输入（手动经纬度编辑）、导出/导入（GeoJSON/CSV）、更完善的错误提示与日志。
	- 验收标准：图片上传稳定、导出导入通过示例数据验证、错误信息对用户友好。

如果你确认上面的路线图，我可以把每一项拆成更小的任务并按优先级逐个实现（每个任务我会提供实现计划、必要代码改动与测试步骤）。
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

注意：云函数依赖微信云开发环境（云数据库、云函数）。在微信开发者工具中调用云函数前，必须在“云开发”面板中开通云环境并授权。如果未开通或无权限，运行时会出现类似错误：

```
Error: cloud.callFunction:fail Error: errCode: -601034  | errMsg: 没有权限，请先开通云开发或者云托管
```

如果不想使用云开发，也可以自行替换 `utils/marker.ts` 中的实现，使用本地存储或外部 API。

## 安装依赖

项目根 `package.json` 只有开发用的依赖声明（`miniprogram-api-typings`）。如需在本地管理依赖：

```powershell
cd d:\Files\code\FishTomatoWorld
npm install
```

注意：微信小程序的依赖通常是放在云函数或需要的模块中，微信开发者工具会处理小程序端的上传与构建。

## 测试

仓库当前未包含自动化测试脚本。你可以手动在微信开发者工具中预览并调试页面与云函数。

离线/回退行为说明：

- 当云函数不可用或调用失败时，客户端会尝试使用本地缓存（`wx.setStorageSync('markers', ...)`）回退并继续显示/保存标记。
- 添加或更新标记时，客户端会尝试先调用云函数写入；若云更新失败，客户端会把变更保存在本地缓存，返回成功（离线模式）。

这能让你在开发或网络受限环境下继续测试地图与标记功能，但请注意本地缓存不会自动同步到云端，若需要离线后同步功能，需要额外实现冲突解决策略或同步机制。

## 贡献

欢迎提交 Issues 或 Pull Requests。简单贡献流程：

1. Fork 仓库并新建分支
2. 实现功能或修复 bug
3. 提交 PR，并在 PR 描述中说明变更与测试方法

## 许可证

项目未在 `package.json` 中指定许可证。若需添加许可证，请在根目录创建 `LICENSE` 文件（例如 MIT）。

---

如果你希望我把 README 翻译成更简短或更详细的版本，或把其中某部分补充具体运行脚本与示例，我可以继续修改。
