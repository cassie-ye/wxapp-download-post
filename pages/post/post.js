// pages/post.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoWidth: 0, // canvas实际宽度（2倍图）
    photoHeight: 0, // canvas实际高度（2倍图）
    screenHeight: 0,
    tempImagePath: '', // 保存临时图片路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.getSystemInfo({
      success: (res) => {
        // 图片统一尺寸：750×1050px，比例 5:7
        // 使用2倍canvas提升清晰度
        const canvasWidth = res.screenWidth * 2; // 2倍图宽度
        const canvasHeight = (res.screenWidth * 2 * 1050 / 750) + (150 * canvasWidth / res.screenHeight * 2); // 2倍图高度
        that.setData({
          screenHeight: res.screenHeight,
          photoWidth: canvasWidth, // canvas实际宽度（2倍图）
          photoHeight: canvasHeight, // canvas实际高度（2倍图）
        })
      }
    })
    this.draw()
  },

  draw() {
    let that = this;
    // 图片统一尺寸：750×1050px，直接获取图片信息
    wx.getImageInfo({
      src: "../../static/1.png",
      success: (imageRes) => {
        let ctx = wx.createCanvasContext('canvasPoster', that);

        // 获取Canvas尺寸（2倍图）
        let canvasWidth = that.data.photoWidth;
        let canvasHeight = that.data.photoHeight;

        ctx.setFillStyle('#7e57c2');
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const imageAreaHeight = canvasWidth * 1050 / 750;
        const whiteAreaHeight = 150 * canvasWidth / this.data.screenHeight * 2;

        // 绘制图片
        ctx.drawImage("../../static/1.png", 0, 0, canvasWidth, imageAreaHeight);

        // 绘制白色区域
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, imageAreaHeight, canvasWidth, whiteAreaHeight);

        // 绘制文字
        // 根据photoWidth（2倍图宽度）计算：rpx转px公式 = rpx * photoWidth / 750
        const fontSize1 = 36 * canvasWidth / 750; // 28rpx对应的2倍图px值
        const fontSize2 = 32 * canvasWidth / 750; // 24rpx对应的2倍图px值
        const leftPadding = 30 * canvasWidth / 750; // 30rpx对应的2倍图px值

        // 计算白色区域信息
        const whiteAreaStartY = imageAreaHeight;
        const whiteAreaCenterY = whiteAreaStartY + whiteAreaHeight / 2;

        // 计算行间距（可以设置为较小字体大小的0.3倍）
        const lineSpacing = fontSize2 * 0.3;
        // 计算两行文字的总高度
        const totalTextHeight = fontSize1 + lineSpacing + fontSize2;

        // 计算第一行文字的y坐标（垂直居中）
        // fillText的y坐标是基线位置，所以需要加上字体大小
        const firstLineY = whiteAreaCenterY - totalTextHeight / 2 + fontSize1;
        // 计算第二行文字的y坐标
        const secondLineY = firstLineY + fontSize1 + lineSpacing;

        // 绘制第一行文字（左对齐，距离左边30rpx）
        ctx.setFontSize(fontSize1);
        ctx.setFillStyle('#000000');
        ctx.setTextAlign('left'); // 左对齐
        ctx.fillText('邀请您一起加入MR.LOVE', leftPadding, firstLineY);

        // 绘制第二行文字（左对齐，距离左边30rpx）
        ctx.setFontSize(fontSize2);
        ctx.setFillStyle('#9C9C9C');
        ctx.setTextAlign('left'); // 左对齐
        ctx.fillText('长按二维码识别', leftPadding, secondLineY);

        // 绘制小程序码
        // 先获取二维码图片信息
        wx.getImageInfo({
          src: "../../static/qr.png",
          success: (qrRes) => {
            // 计算二维码尺寸（正方形，高度为白色区域的80%，确保有边距）
            const qrSize = whiteAreaHeight * 0.8;
            // 计算x坐标：距离右边30rpx
            const rightPadding = 30 * canvasWidth / 750; // 30rpx对应的2倍图px值
            const qrX = canvasWidth - rightPadding - qrSize;
            // 计算y坐标：垂直居中
            const qrY = whiteAreaCenterY - qrSize / 2;
            
            // 绘制二维码（正方形）
            ctx.drawImage("../../static/qr.png", qrX, qrY, qrSize, qrSize);
            
            // 绘制所有内容（包括二维码）
            that.drawCanvas(ctx, canvasWidth, canvasHeight);
          },
          fail: (err) => {
            console.error('获取二维码图片失败:', err);
            // 即使二维码加载失败，也继续绘制其他内容
            that.drawCanvas(ctx, canvasWidth, canvasHeight);
          }
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败:', err);
        wx.showToast({
          title: '图片加载失败',
          icon: 'none'
        });
      }
    });
  },

  // 绘制canvas并保存
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
                let path = res.tempFilePath//获取到了临时地址
                // 保存临时路径，供按钮点击时使用
                that.setData({
                  tempImagePath: path
                });
              }
            }, that);//新版小程序不加this不会执行
          }, 200);
        });
  },

  // 保存图片到相册
  saveImage() {
    if (!this.data.tempImagePath) {
      wx.showToast({
        title: '图片生成中，请稍候',
        icon: 'none'
      });
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
            title: '提示',
            content: '需要您授权保存相册权限',
            showCancel: true,
            confirmText: '去设置',
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
                title: '需要相册权限',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 执行保存图片
  doSaveImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.tempImagePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
        console.error('保存图片失败:', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})