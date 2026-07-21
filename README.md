# Luna Arcana

一个完全在浏览器本地运行的私人塔罗空间，支持每日抽牌、问题占卜、完整 78 张牌库、本地智能解读与单牌收藏。

## 本地运行

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build
npm run preview
```

占卜问题与结果不会被保存。只有收藏牌和设置保存在浏览器 LocalStorage 中，不会上传到服务器。

## GitHub Pages

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到：

<https://koajsj.github.io/tarot/>
