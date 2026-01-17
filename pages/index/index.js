// index.js
Page({
  data: {
    width: '',
    height: '',
    addHeight: '',
    pixelRatio: 2, // 像素比
    resultValArr: '', // eg: 分值XX, 没有抑郁
    poster: '', // 保存
    saveQR: '../images/save/qr.jpg',
    // swiper
    background: [], // 图片列表
    indicatorDots: true,
    indicatorColor: 'rgba(255, 255, 255, .3)',
    indicatorActiveColor: 'rgba(255, 255, 255, 1)',
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    current: 0,
    spinShow: true, // 页面加载动画
    btnLoading: false, // 按钮加载状态
    imgAuthBtn: false, // 图片重新授权
  },
  onLoad(options) {
    let that = this;
    // 切割路由传参
    if (options.resultVal) {
      that.setData({
        resultValArr: options.resultVal.split(' ')
      });
    } else {
      // 如果没有传参，设置默认值用于测试
      that.setData({
        resultValArr: ['测试', '没有抑郁']
      });
    }
    // 加载图片
    that.getImage();
    wx.getSystemInfo({
      success(res) {
        let screenWidthPx = res.screenWidth;
        let screenHeightPx = res.screenHeight;
        // 放大画布的大小, 因为canvas保存会变模糊
        that.setData({
          width: screenWidthPx * 2,
          height: screenHeightPx * 2
        });
      }
    });
  },
  cancel() {
    wx.navigateBack({
      delta: 1
    });
  },
  confirm() {
    let that = this;
    that.setData({
      btnLoading: true
    });
    that.drawImage();
  },
  currentChange(e) {
    // 轮播图变动更新图片索引
    let that = this;
    that.setData({
      current: e.detail.current
    });
  },
  // 动态转换大小, 依照iphone5的screen宽高, 320*568,因为是二倍图所以乘以2
  // 当前手机的宽/iphone5的宽 =  X/在iphone5设置的坐标 , X是当前手机要设置的坐标
  pxW(width, px) {
    return (width / (320 * 2)) * px * 2;
  },
  pxH(height, px) {
    return (height / (568 * 2)) * px * 2;
  },
  pxFS(width, px) {
    return (width / (2 * 320)) * px;
  },
  drawImage() {
    let that = this;
    let width = that.data.width;
    let height = that.data.height;
    let pixelRatio = that.data.pixelRatio;

    let ctx = wx.createCanvasContext('canvasPoster', this);

    // 网络图片需要获取图片临时地址,canvas才能使用
    wx.getImageInfo({
      src: that.data.background[that.data.current].tempFileURL,
      success(res) {
        // 插入图片
        ctx.drawImage(res.path, 0, 0, width, height);

        // 插入底部虚化背景(为啥我放最前面,因为放二维码前面,奇怪的安卓会遮住二维码)
        let X3 = 0;
        let Y3 = that.pxH(height, 450);
        let w3 = width;
        let h3 = that.pxH(height, 200);
        ctx.setFillStyle('rgba(0,0,0,.3)');
        ctx.fillRect(X3, Y3, w3, h3);

        // 插入上条 joint
        let Xl = that.pxW(width, 25);
        let Yl = that.pxH(height, 25);
        let wl = 2;
        let hl = that.pxH(height, 20);
        ctx.setFillStyle('#fff');
        ctx.fillRect(Xl, Yl, wl, hl);

        // 插入左条 joint
        let Xr = that.pxW(width, 25);
        let Yr = that.pxH(height, 25);
        let wr = that.pxW(width, 20);
        let hr = 2;
        ctx.setFillStyle('#fff');
        ctx.fillRect(Xr, Yr, wr, hr);

        // 插入分值结果文字
        let resultValArr = that.data.resultValArr;
        ctx.setFontSize(that.pxFS(width, 54));
        ctx.setFillStyle('#fff');
        let X0 = that.pxW(width, 40);
        let Y0 = that.pxH(height, 70);
        ctx.fillText(resultValArr[1], X0, Y0);

        ctx.setFontSize(that.pxFS(width, 22));
        ctx.setFillStyle('#fff');
        let X1 = that.pxW(width, 90);
        let Y1 = that.pxH(height, 110);
        ctx.fillText('"愿你被世界温柔以待"', X1, Y1);

        // 二维码图片
        let saveQR = that.data.saveQR;
        let qrcodeWH = that.pxW(width, 73);
        let qrcodeX = that.pxW(width, 20);
        let qrcodeY = that.pxH(height, 470);
        wx.getImageInfo({
          src: saveQR,
          success(qrRes) {
            ctx.drawImage(qrRes.path, qrcodeX, qrcodeY, qrcodeWH, qrcodeWH);

            // 插入文字
            ctx.setFontSize(that.pxFS(width, 30));
            ctx.setFillStyle('#fff');
            let X5 = that.pxW(width, 130);
            let Y5 = that.pxH(height, 495);
            ctx.fillText('小 绿 抑 郁 测 试 助 手', X5, Y5);

            // 插入文字
            ctx.setFontSize(that.pxFS(width, 30));
            ctx.setFillStyle('#fff');
            let X6 = that.pxW(width, 130);
            let Y6 = that.pxH(height, 525);
            ctx.fillText('压 码 免 费 测 量', X6, Y6);
            ctx.draw();

            setTimeout(() => {
              wx.canvasToTempFilePath({
                canvasId: 'canvasPoster',
                x: 0,
                y: 0,
                width: that.data.width,
                height: that.data.height,
                destWidth: that.data.width,
                destHeight: that.data.height,
                success: res => {
                  that.setData({
                    poster: res.tempFilePath
                  });
                  that.saveImage();
                },
                fail: err => {
                  console.error('canvasToTempFilePath fail', err);
                  that.setData({
                    btnLoading: false
                  });
                }
              });
            }, 200);
          },
          fail: err => {
            console.error('getImageInfo QR fail', err);
            that.setData({
              btnLoading: false
            });
          }
        });
      },
      fail: err => {
        console.error('getImageInfo fail', err);
        that.setData({
          btnLoading: false
        });
      }
    });
  },
  saveImage() {
    let that = this;
    if (that.data.poster) {
      wx.getSetting({ // 获取设置
        success(res) {
          wx.authorize({ // 获取相册授权信息
            scope: 'scope.writePhotosAlbum',
            success() { // 已授权
              wx.saveImageToPhotosAlbum({
                filePath: that.data.poster,
                success: () => {
                  wx.showToast({
                    title: '海报已保存，快去分享给好友吧。',
                    icon: 'none'
                  });
                  that.setData({
                    btnLoading: false
                  });
                },
                fail() { // 一般保存出错会出现(可删除)
                  that.setData({
                    imgAuthBtn: true
                  });
                  wx.showToast({
                    title: '未知错误请反馈',
                    icon: 'none',
                  });
                }
              });
            },
            fail() { // 未授权
              that.setData({
                btnLoading: false,
                imgAuthBtn: true
              });
              wx.showToast({
                title: '保存失败请授权',
                icon: 'none',
              });
            }
          });
        }
      });
    }
  },
  getImage() {
    let that = this;
    // 检查云开发是否初始化
    if (!wx.cloud) {
      console.error('云开发未初始化');
      that.setData({
        spinShow: false
      });
      wx.showToast({
        title: '云开发未初始化',
        icon: 'none'
      });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'getCanvasList'
    }).then(res => {
      console.log('getCanvasList success', res);
      that.setData({
        spinShow: false,
        background: res.result || []
      });
      if (!res.result || res.result.length === 0) {
        wx.showToast({
          title: '暂无图片数据',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('getCanvasList fail', err);
      that.setData({
        spinShow: false
      });
      wx.showToast({
        title: '加载图片失败',
        icon: 'none'
      });
    });
  },
  checkImgAuthFun(res) { // 二次以上检验是否授权图片
    let that = this;
    if (!res.detail.authSetting['scope.writePhotosAlbum']) { // 二次以上授权, 如果未授权
      that.setData({
        imgAuthBtn: true // 显示授权按钮
      });
      wx.showToast({
        title: '授权失败',
        icon: 'none',
      });
    } else {
      that.setData({
        imgAuthBtn: false // 不显示授权按钮
      });
      wx.showToast({
        title: '授权成功',
        icon: 'none',
      });
    }
  },
});
