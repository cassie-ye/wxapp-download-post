// pages/post.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 组件需要的属性
    backgroundImage: '../../static/1.png',
    qrImage: '../../static/qr.png',
    primaryText: '邀请您一起加入POPO',
    secondaryText: '长按二维码识别',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 组件会自动初始化，无需手动调用
  },

  /**
   * 保存图片 - 调用组件的方法
   */
  saveImage() {
    // 通过 selectComponent 获取组件实例并调用其方法
    const poster = this.selectComponent('#poster');
    if (poster) {
      poster.saveImage();
    } else {
      wx.showToast({
        title: '组件未找到',
        icon: 'none'
      });
    }
  },

  /**
   * 组件绘制完成事件
   */
  onDrawComplete(e) {
    console.log('绘制完成:', e.detail);
  },

  /**
   * 保存成功事件
   */
  onSaveSuccess(e) {
    console.log('保存成功:', e.detail);
  },

  /**
   * 保存失败事件
   */
  onSaveError(e) {
    console.log('保存失败:', e.detail);
  },

  /**
   * 错误事件
   */
  onError(e) {
    console.error('组件错误:', e.detail);
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