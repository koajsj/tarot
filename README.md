# Luna Arcana · 私人塔罗空间

一个完全在浏览器本地运行的沉浸式塔罗 Web App。无需登录、无需服务器，也不会上传占卜内容；打开网页，安静地提出问题，然后从完整的 78 张塔罗牌中抽取属于此刻的讯息。

[在线体验](https://koajsj.github.io/tarot/) · [部署状态](https://github.com/koajsj/tarot/actions/workflows/deploy-pages.yml)

## 功能亮点

- **沉浸式占卜流程**：提问、选择主题、洗牌、横向选牌、3D 翻牌与逐字解读。
- **五种问题主题**：爱情、事业、财富、人生与自由问题。
- **四种牌阵**：单牌指引、过去／现在／未来、爱情牌阵和事业牌阵。
- **完整 78 张牌库**：包含 22 张大阿卡纳与 56 张小阿卡纳，并提供正位、逆位、关键词及不同领域的详细释义。
- **本地规则解读**：结合问题主题、牌阵位置、正逆位和牌义，在浏览器内生成自然连贯的解读，不调用外部 AI。
- **灵活抽牌**：可在完整横向牌组中凭直觉选牌，也可使用“让牌替我选择”随机抽取。
- **牌库与收藏**：浏览全部牌面、查看完整详情，并收藏产生共鸣的单牌。
- **个性化仪式**：提供星图、极光、曜石三种牌背，可独立开关动画和轻柔音效。
- **响应式体验**：适配桌面、平板和手机，支持触控横滑、键盘操作、减少动态效果偏好。

## 隐私与数据

Luna Arcana 是纯前端静态应用，不包含用户系统、后台、数据库或任何外部 AI 服务。

- 占卜问题、抽牌结果和解读只存在于当前页面会话中，**不会保存**。
- 只有收藏牌的 ID 与个人设置会写入当前浏览器的 `LocalStorage`。
- 数据不会离开设备，也不会发送到服务器。
- 清理该站点的浏览器数据后，收藏和设置会一并消失。

项目不提供日记或历史记录功能。

## 技术栈

- Vue 3（Composition API）
- Vite 7
- TypeScript 5
- 原生 CSS 动画、3D 变换与玻璃拟态效果
- LocalStorage
- GitHub Actions + GitHub Pages

项目保持轻量，目前只有 Vue 这一项运行时依赖。

## 本地运行

需要 Node.js 22 或兼容版本，以及 npm。

```bash
git clone https://github.com/koajsj/tarot.git
cd tarot
npm install
npm run dev
```

开发服务器启动后，按终端显示的本地地址访问即可。

## 构建与预览

```bash
npm run build
npm run preview
```

`npm run build` 会先执行 Vue 与 TypeScript 类型检查，再生成生产文件到 `dist/`。

## GitHub Pages 部署

仓库已经配置 [GitHub Actions 工作流](.github/workflows/deploy-pages.yml)。推送到 `main` 分支后会自动：

1. 使用 Node.js 22 安装锁定依赖；
2. 执行生产构建；
3. 上传 `dist/`；
4. 发布到 <https://koajsj.github.io/tarot/>。

首次部署时，需要在仓库的 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

当前 Vite 公共路径为 `/tarot/`。如果仓库改名，需要同步修改 [`vite.config.ts`](vite.config.ts) 中的 `base`。

## 项目结构

```text
tarot/
├── .github/workflows/
│   └── deploy-pages.yml       # GitHub Pages 自动部署
├── public/assets/             # 静态牌背素材
├── src/
│   ├── components/
│   │   ├── StarField.vue      # 动态星空背景
│   │   └── TarotCard.vue      # 塔罗牌与翻牌表现
│   ├── data/
│   │   └── tarot.ts           # 78 张牌、主题与牌阵数据
│   ├── lib/
│   │   ├── reading.ts         # 抽牌与本地规则解读
│   │   └── storage.ts         # 收藏和设置的本地存储
│   ├── App.vue                # 页面状态与完整占卜流程
│   ├── main.ts                # 应用入口
│   ├── styles.css             # 视觉系统、动画与响应式布局
│   └── types.ts               # TypeScript 类型定义
├── index.html
├── package.json
└── vite.config.ts
```

## 使用说明

1. 在首页选择“开始占卜”，输入问题并选择主题与牌阵。
2. 等待洗牌仪式完成，横向滑动完整牌组并选择牌面；也可以随机抽取。
3. 抽满牌阵所需数量后，阅读结合当前位置与正逆位生成的本地解读。
4. 在牌库或结果详情中收藏喜欢的牌；在设置页调整牌背、动画和音效。

塔罗更适合作为自我观察与整理思绪的工具，不应替代医疗、法律、财务等专业意见。

## 后续可优化方向

- 增加更多牌面视觉主题与可下载的离线资源包。
- 在不保存个人问题的前提下，继续丰富本地解读规则与组合牌义。
- 增加可选的 PWA 离线安装能力。
- 补充自动化端到端测试与更多无障碍场景验证。

## License

当前仓库未声明开源许可证。未经仓库所有者许可，请勿复制或再分发项目内容与素材。
