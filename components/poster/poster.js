/**
 * 海报生成组件
 * 
 * @description 一个高度可配置的海报生成组件，支持自定义图片、文字、颜色、字体、间距等所有样式
 * 
 * @example
 * // 基础使用
 * <poster 
 *   background-image="../../static/bg.png"
 *   qr-image="../../static/qr.png"
 *   primary-text="邀请您一起加入"
 *   secondary-text="长按二维码识别"
 * />
 * 
 * @example
 * // 自定义样式
 * <poster 
 *   background-image="../../static/bg.png"
 *   qr-image="../../static/qr.png"
 *   primary-text="自定义标题"
 *   secondary-text="自定义副标题"
 *   canvas-background-color="#ff0000"
 *   primary-text-color="#333333"
 *   primary-text-size="32"
 * />
 * 
 * @example
 * // 调用保存方法
 * const poster = this.selectComponent('#poster');
 * poster.saveImage();
 * 
 * @events
 * - drawcomplete: 绘制完成事件，返回 { tempImagePath }
 * - savesuccess: 保存成功事件，返回 { tempImagePath }
 * - saveerror: 保存失败事件，返回 { err, message }
 * - error: 错误事件，返回 { err }
 */
// components/poster/poster.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // ========== 内容相关 ==========
    // 背景图片
    backgroundImage: {
      type: String,
      value: ''
    },
    // 二维码图片
    qrImage: {
      type: String,
      value: ''
    },
    // 主文本
    primaryText: {
      type: String,
      value: '邀请您一起加入POPO'
    },
    // 次文本
    secondaryText: {
      type: String,
      value: '长按二维码识别'
    },
    
    // ========== Canvas相关 ==========
    // Canvas背景色
    canvasBackgroundColor: {
      type: String,
      value: '#7e57c2'
    },
    // Canvas缩放比例（用于隐藏canvas，不影响实际尺寸）
    canvasZoom: {
      type: Number,
      value: 40
    },
    // 图片尺寸比例（宽:高），默认 750:1050
    imageRatio: {
      type: Object,
      value: {
        width: 750,
        height: 1050
      }
    },
    // 白色区域高度（rpx单位，会被转换为px）
    whiteAreaHeight: {
      type: Number,
      value: 150
    },
    
    // ========== 颜色配置 ==========
    // 白色区域背景色
    whiteAreaBackgroundColor: {
      type: String,
      value: '#ffffff'
    },
    // 主文本颜色
    primaryTextColor: {
      type: String,
      value: '#000000'
    },
    // 次文本颜色
    secondaryTextColor: {
      type: String,
      value: '#9C9C9C'
    },
    
    // ========== 字体配置 ==========
    // 主文本字体大小（rpx单位）
    primaryTextSize: {
      type: Number,
      value: 28
    },
    // 次文本字体大小（rpx单位）
    secondaryTextSize: {
      type: Number,
      value: 24
    },
    // 行间距比例（相对于次文本字体大小的倍数）
    lineSpacingRatio: {
      type: Number,
      value: 0.3
    },
    
    // ========== 间距配置 ==========
    // 左边距（rpx单位）
    leftPadding: {
      type: Number,
      value: 30
    },
    // 右边距（rpx单位）
    rightPadding: {
      type: Number,
      value: 30
    },
    // 二维码大小比例（相对于白色区域高度的比例，0-1之间）
    qrSizeRatio: {
      type: Number,
      value: 0.8
    },
    
    // ========== 提示信息配置 ==========
    // 图片生成中的提示
    loadingText: {
      type: String,
      value: '图片生成中，请稍候'
    },
    // 图片加载失败提示
    imageLoadErrorText: {
      type: String,
      value: '图片加载失败'
    },
    // 需要相册权限提示标题
    permissionModalTitle: {
      type: String,
      value: '提示'
    },
    // 需要相册权限提示内容
    permissionModalContent: {
      type: String,
      value: '需要您授权保存相册权限'
    },
    // 权限设置按钮文字
    permissionModalConfirmText: {
      type: String,
      value: '去设置'
    },
    // 需要相册权限Toast提示
    needPermissionText: {
      type: String,
      value: '需要相册权限'
    },
    // 保存成功提示
    saveSuccessText: {
      type: String,
      value: '保存成功'
    },
    // 保存失败提示
    saveErrorText: {
      type: String,
      value: '保存失败'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    photoWidth: 0, // canvas实际宽度（2倍图）
    photoHeight: 0, // canvas实际高度（2倍图）
    screenHeight: 0,
    tempImagePath: '', // 保存临时图片路径
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件实例进入页面节点树时执行
      this.initCanvas();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 初始化Canvas
     */
    initCanvas() {
      let that = this;
      wx.getSystemInfo({
        success: (res) => {
          const { imageRatio, whiteAreaHeight } = that.properties;
          // 使用2倍canvas提升清晰度
          const canvasWidth = res.screenWidth * 2; // 2倍图宽度
          // 根据配置的图片比例计算高度
          const imageAreaHeight = canvasWidth * imageRatio.height / imageRatio.width;
          // 白色区域高度转换为px（2倍图）
          const whiteAreaHeightPx = whiteAreaHeight * canvasWidth / res.screenHeight * 2;
          const canvasHeight = imageAreaHeight + whiteAreaHeightPx;
          
          that.setData({
            screenHeight: res.screenHeight,
            photoWidth: canvasWidth, // canvas实际宽度（2倍图）
            photoHeight: canvasHeight, // canvas实际高度（2倍图）
          });
          // 初始化完成后绘制
          that.draw();
        }
      });
    },

    /**
     * 绘制Canvas
     */
    draw() {
      let that = this;
      const { 
        backgroundImage, 
        qrImage, 
        primaryText, 
        secondaryText,
        canvasBackgroundColor,
        imageRatio,
        whiteAreaHeight,
        whiteAreaBackgroundColor,
        primaryTextColor,
        secondaryTextColor,
        primaryTextSize,
        secondaryTextSize,
        lineSpacingRatio,
        leftPadding,
        rightPadding,
        qrSizeRatio,
        imageLoadErrorText
      } = this.properties;
      
      if (!backgroundImage) {
        console.warn('背景图片未设置');
        return;
      }

      // 获取图片信息
      wx.getImageInfo({
        src: backgroundImage,
        success: (imageRes) => {
          let ctx = wx.createCanvasContext('canvasPoster', that);

          // 获取Canvas尺寸（2倍图）
          let canvasWidth = that.data.photoWidth;
          let canvasHeight = that.data.photoHeight;

          // 绘制Canvas背景
          ctx.setFillStyle(canvasBackgroundColor);
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // 计算图片区域高度
          const imageAreaHeight = canvasWidth * imageRatio.height / imageRatio.width;
          // 白色区域高度转换为px（2倍图）
          const whiteAreaHeightPx = whiteAreaHeight * canvasWidth / this.data.screenHeight * 2;

          // 绘制背景图片
          ctx.drawImage(backgroundImage, 0, 0, canvasWidth, imageAreaHeight);

          // 绘制白色区域
          ctx.setFillStyle(whiteAreaBackgroundColor);
          ctx.fillRect(0, imageAreaHeight, canvasWidth, whiteAreaHeightPx);

          // 绘制文字
          // 根据photoWidth（2倍图宽度）计算：rpx转px公式
          // 原逻辑：28rpx -> 36 * canvasWidth / 750, 24rpx -> 32 * canvasWidth / 750
          // 转换系数：主文本 36/28 ≈ 1.286, 次文本 32/24 ≈ 1.333
          const primaryTextRatio = 36 / 28; // 保持与原逻辑一致的转换系数
          const secondaryTextRatio = 32 / 24;
          const fontSize1 = primaryTextSize * primaryTextRatio * canvasWidth / 750; // 主文本2倍图px值
          const fontSize2 = secondaryTextSize * secondaryTextRatio * canvasWidth / 750; // 次文本2倍图px值
          const leftPaddingPx = leftPadding * canvasWidth / 750; // 左边距2倍图px值

          // 计算白色区域信息
          const whiteAreaStartY = imageAreaHeight;
          const whiteAreaCenterY = whiteAreaStartY + whiteAreaHeightPx / 2;

          // 计算行间距
          const lineSpacing = fontSize2 * lineSpacingRatio;
          // 计算两行文字的总高度
          const totalTextHeight = fontSize1 + lineSpacing + fontSize2;

          // 计算第一行文字的y坐标（垂直居中）
          // fillText的y坐标是基线位置，所以需要加上字体大小
          const firstLineY = whiteAreaCenterY - totalTextHeight / 2 + fontSize1;
          // 计算第二行文字的y坐标
          const secondLineY = firstLineY + fontSize1 + lineSpacing;

          // 绘制第一行文字（左对齐）
          ctx.setFontSize(fontSize1);
          ctx.setFillStyle(primaryTextColor);
          ctx.setTextAlign('left');
          ctx.fillText(primaryText, leftPaddingPx, firstLineY);

          // 绘制第二行文字（左对齐）
          ctx.setFontSize(fontSize2);
          ctx.setFillStyle(secondaryTextColor);
          ctx.setTextAlign('left');
          ctx.fillText(secondaryText, leftPaddingPx, secondLineY);

          // 绘制小程序码
          if (qrImage) {
            // 先获取二维码图片信息
            wx.getImageInfo({
              src: qrImage,
              success: (qrRes) => {
                // 计算二维码尺寸（正方形，根据配置的比例）
                const qrSize = whiteAreaHeightPx * qrSizeRatio;
                // 计算x坐标：距离右边
                const rightPaddingPx = rightPadding * canvasWidth / 750; // 右边距2倍图px值
                const qrX = canvasWidth - rightPaddingPx - qrSize;
                // 计算y坐标：垂直居中
                const qrY = whiteAreaCenterY - qrSize / 2;
                
                // 绘制二维码（正方形）
                ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
                
                // 绘制所有内容（包括二维码）
                that.drawCanvas(ctx, canvasWidth, canvasHeight);
              },
              fail: (err) => {
                console.error('获取二维码图片失败:', err);
                // 即使二维码加载失败，也继续绘制其他内容
                that.drawCanvas(ctx, canvasWidth, canvasHeight);
              }
            });
          } else {
            // 没有二维码，直接绘制其他内容
            that.drawCanvas(ctx, canvasWidth, canvasHeight);
          }
        },
        fail: (err) => {
          console.error('获取图片信息失败:', err);
          wx.showToast({
            title: imageLoadErrorText,
            icon: 'none'
          });
          // 触发错误事件
          that.triggerEvent('error', { err });
        }
      });
    },

    /**
     * 绘制canvas并保存
     */
    drawCanvas(ctx, canvasWidth, canvasHeight) {
      let that = this;
      ctx.draw(true, () => {
        //然后生成一个保存用的临时地址, 因为安卓机兼容问题, 所以方法要延迟.
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvasId: 'canvasPoster',
            x: 0,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            destWidth: canvasWidth,
            destHeight: canvasHeight,
            success: res => {
              let path = res.tempFilePath; //获取到了临时地址
              // 保存临时路径，供按钮点击时使用
              that.setData({
                tempImagePath: path
              });
              // 触发绘制完成事件
              that.triggerEvent('drawcomplete', { tempImagePath: path });
            },
            fail: (err) => {
              console.error('生成临时图片失败:', err);
              that.triggerEvent('error', { err });
            }
          }, that); //新版小程序不加this不会执行
        }, 200);
      });
    },

    /**
     * 保存图片到相册
     * 暴露给外部调用的方法
     */
    saveImage() {
      const { loadingText, permissionModalTitle, permissionModalContent, permissionModalConfirmText, needPermissionText } = this.properties;
      
      if (!this.data.tempImagePath) {
        wx.showToast({
          title: loadingText,
          icon: 'none'
        });
        // 触发事件通知父组件
        this.triggerEvent('saveerror', { message: loadingText });
        return;
      }

      // 检查授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.writePhotosAlbum']) {
            // 已授权，直接保存
            this.doSaveImage();
          } else if (res.authSetting['scope.writePhotosAlbum'] === false) {
            // 已拒绝授权，引导用户开启
            wx.showModal({
              title: permissionModalTitle,
              content: permissionModalContent,
              showCancel: true,
              confirmText: permissionModalConfirmText,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting();
                }
              }
            });
          } else {
            // 未授权，请求授权
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: () => {
                this.doSaveImage();
              },
              fail: () => {
                wx.showToast({
                  title: needPermissionText,
                  icon: 'none'
                });
                this.triggerEvent('saveerror', { message: needPermissionText });
              }
            });
          }
        }
      });
    },

    /**
     * 执行保存图片
     */
    doSaveImage() {
      const { saveSuccessText, saveErrorText } = this.properties;
      
      wx.saveImageToPhotosAlbum({
        filePath: this.data.tempImagePath,
        success: () => {
          wx.showToast({
            title: saveSuccessText,
            icon: 'success'
          });
          // 触发保存成功事件
          this.triggerEvent('savesuccess', { tempImagePath: this.data.tempImagePath });
        },
        fail: (err) => {
          wx.showToast({
            title: saveErrorText,
            icon: 'none'
          });
          console.error('保存图片失败:', err);
          // 触发保存失败事件
          this.triggerEvent('saveerror', { err });
        }
      });
    }
  }
});
