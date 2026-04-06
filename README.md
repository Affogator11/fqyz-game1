# 封丘一中：高三生存法则 V2.0

> "南街的灯火，是为了照亮奋斗的人"

一款 AI 驱动的文字养成游戏，复刻高三生活的酸甜苦辣。

## 🎮 在线体验

**Cloudflare Pages 部署地址**: `https://你的项目名.pages.dev`

## 📁 项目结构

```
├── src/
│   ├── components/    # UI 组件
│   ├── data/          # 本地事件库 (45+ 事件)
│   ├── hooks/         # 游戏状态管理
│   ├── services/      # AI 事件生成服务
│   └── types/         # TypeScript 类型定义
├── dist/              # 构建输出
├── index.html
├── package.json
├── vite.config.ts
└── wrangler.toml      # Cloudflare 配置
```

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## ☁️ Cloudflare Pages 部署

### 方式一：Git 集成（推荐）

1. Fork 或 Push 代码到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 **Workers & Pages** → **Create application** → **Pages**
4. 选择 **Connect to Git**
5. 选择你的仓库，配置如下：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**

### 方式二：Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy dist
```

## 🎯 游戏特色

- **三位班主任**: 严师王俊玲、良师许卫峰、精英周立俊
- **AI 动态叙事**: 讯飞 Spark-Lite 实时生成个性化事件
- **本地事件兜底**: API 失败时自动切换至 45+ 预设事件
- **数值平衡系统**: 学习手感、压力、健康、幸福度相互影响
- **40周极限挑战**: 体验真实的高三节奏

## 🛠️ 技术栈

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Cloudflare Pages

## 📄 License

MIT
