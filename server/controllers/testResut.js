const yapi = require('../yapi.js');
const baseController = require('./base.js');
const testResultModel = require('../models/testResult.js');

class interfaceColController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.testResultModel = yapi.getInst(testResultModel);
  }
  /**
   * 测试结果集
   * @interface /testResutl/list
   * @method POST
   * @return {Object}
   * @example
   */
  async findSection(ctx) {
    try {
      let params = ctx.request.query;
      let res = await this.testResultModel.findSection(params);
      if (res) {
        ctx.body = yapi.commons.resReturn(res);
      } else {
        ctx.body = yapi.commons.resReturn(null, 402, '错误');
      }
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }
}

module.exports = interfaceColController;
