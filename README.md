# Jinyi Yang Personal Website

一个纯静态的中文个人主页项目，直接用 `index.html`、`styles.css` 和 `script.js` 组成。

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 8000
```

然后打开：

`http://localhost:8000`

## 修改内容

- `index.html`：页面文案、模块结构
- `styles.css`：配色、布局、视觉风格
- `script.js`：互动逻辑和小游戏

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库
2. 把这个项目推送到仓库的 `main` 或 `master` 分支
3. 进入 GitHub 仓库 `Settings > Pages`
4. 在 `Build and deployment` 里选择 `GitHub Actions`
5. 推送代码后，等待 Actions 跑完
6. GitHub Pages 会生成一个公开网址

## 备注

项目已经内置 `.github/workflows/deploy-pages.yml`，推到 GitHub 后就可以自动部署。
