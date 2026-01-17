# wxapp-poster

、支持自定义配置，零依赖，开箱即用

## 特性

- 🎨 **高度可配置** - 支持自定义所有样式参数
- 📱 **微信小程序原生组件** - 基于 Component 构建
- 🖼️ **Canvas 绘制** - 使用 2 倍图提升清晰度
- 💾 **保存到相册** - 内置保存功能，支持权限处理
- 📦 **零依赖** - 不依赖任何第三方库
- 🔧 **低耦合** - 所有配置项均可自定义

## 安装

### 方式一：npm 安装

```bash
npm install wxapp-poster
```

### 方式二：通过微信开发者工具

1. 在微信开发者工具中，点击菜单栏 `工具` -> `构建 npm`
2. 构建完成后，在 `node_modules` 目录下会生成 `wxapp-poster` 目录

## 使用

### 1. 在页面或组件的 json 文件中引入组件

```json
{
  "usingComponents": {
    "poster": "wxapp-poster/poster"
  }
}
```

### 2. 在 wxml 中使用组件

```xml
<poster 
  id="poster"
  background-image="../../static/bg.png"
  qr-image="../../static/qr.png"
  primary-text="邀请您一起加入POPO"
  secondary-text="长按二维码识别"
  bind:drawcomplete="onDrawComplete"
  bind:savesuccess="onSaveSuccess"
  bind:saveerror="onSaveError"
  bind:error="onError"
/>
```

### 3. 在 js 中调用保存方法

```javascript
Page({
  // 保存图片
  saveImage() {
    const poster = this.selectComponent('#poster');
    if (poster) {
      poster.saveImage();
    }
  },
  
  // 绘制完成事件
  onDrawComplete(e) {
    console.log('绘制完成:', e.detail.tempImagePath);
  },
  
  // 保存成功事件
  onSaveSuccess(e) {
    console.log('保存成功:', e.detail.tempImagePath);
  },
  
  // 保存失败事件
  onSaveError(e) {
    console.log('保存失败:', e.detail);
  },
  
  // 错误事件
  onError(e) {
    console.error('组件错误:', e.detail);
  }
});
```

## API

### 属性 (Properties)

#### 内容相关

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| background-image | String | '' | 背景图片路径（必填） |
| qr-image | String | '' | 二维码图片路径 |
| primary-text | String | '邀请您一起加入POPO' | 主文本内容 |
| secondary-text | String | '长按二维码识别' | 次文本内容 |

#### Canvas 相关

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| canvas-background-color | String | '#7e57c2' | Canvas 背景色 |
| canvas-zoom | Number | 40 | Canvas 缩放比例（用于隐藏 canvas） |
| image-ratio | Object | {width: 750, height: 1050} | 图片尺寸比例 |
| white-area-height | Number | 150 | 白色区域高度（rpx） |

#### 颜色配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| white-area-background-color | String | '#ffffff' | 白色区域背景色 |
| primary-text-color | String | '#000000' | 主文本颜色 |
| secondary-text-color | String | '#9C9C9C' | 次文本颜色 |

#### 字体配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| primary-text-size | Number | 28 | 主文本字体大小（rpx） |
| secondary-text-size | Number | 24 | 次文本字体大小（rpx） |
| line-spacing-ratio | Number | 0.3 | 行间距比例（相对于次文本字体大小） |

#### 间距配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| left-padding | Number | 30 | 左边距（rpx） |
| right-padding | Number | 30 | 右边距（rpx） |
| qr-size-ratio | Number | 0.8 | 二维码大小比例（0-1 之间） |

#### 提示信息配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| loading-text | String | '图片生成中，请稍候' | 图片生成中提示 |
| image-load-error-text | String | '图片加载失败' | 图片加载失败提示 |
| permission-modal-title | String | '提示' | 权限提示标题 |
| permission-modal-content | String | '需要您授权保存相册权限' | 权限提示内容 |
| permission-modal-confirm-text | String | '去设置' | 权限设置按钮文字 |
| need-permission-text | String | '需要相册权限' | 需要权限提示 |
| save-success-text | String | '保存成功' | 保存成功提示 |
| save-error-text | String | '保存失败' | 保存失败提示 |

### 方法 (Methods)

#### saveImage()

保存图片到相册。需要在页面中通过 `selectComponent` 获取组件实例后调用。

```javascript
const poster = this.selectComponent('#poster');
poster.saveImage();
```

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| drawcomplete | 绘制完成 | { tempImagePath } |
| savesuccess | 保存成功 | { tempImagePath } |
| saveerror | 保存失败 | { err, message } |
| error | 组件错误 | { err } |

## 完整示例

```xml
<!-- index.wxml -->
<view class="container">
  <poster 
    id="poster"
    background-image="{{backgroundImage}}"
    qr-image="{{qrImage}}"
    primary-text="{{primaryText}}"
    secondary-text="{{secondaryText}}"
    canvas-background-color="#ff0000"
    primary-text-color="#333333"
    primary-text-size="32"
    bind:drawcomplete="onDrawComplete"
    bind:savesuccess="onSaveSuccess"
  />
  
  <button bindtap="saveImage">保存图片</button>
</view>
```

```javascript
// index.js
Page({
  data: {
    backgroundImage: '../../static/bg.png',
    qrImage: '../../static/qr.png',
    primaryText: '邀请您一起加入',
    secondaryText: '长按二维码识别'
  },
  
  saveImage() {
    const poster = this.selectComponent('#poster');
    if (poster) {
      poster.saveImage();
    }
  },
  
  onDrawComplete(e) {
    console.log('绘制完成，临时路径:', e.detail.tempImagePath);
  },
  
  onSaveSuccess(e) {
    console.log('保存成功，临时路径:', e.detail.tempImagePath);
  }
});
```

## 注意事项

1. **图片路径**：建议使用网络图片或本地绝对路径，相对路径可能在某些情况下无法正常加载
2. **权限处理**：组件会自动处理相册保存权限，首次使用会弹出授权提示
3. **Canvas 限制**：由于微信小程序的限制，Canvas 会被隐藏（通过 zoom 属性），实际绘制在后台完成
4. **图片尺寸**：默认图片比例为 750:1050，可通过 `image-ratio` 属性自定义

## 更新日志

### 1.0.0

- 初始版本发布
- 支持自定义所有样式参数
- 支持保存图片到相册
- 完整的事件回调支持

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
