const _ = require('lodash');
const yapi = require('../yapi.js');
const baseController = require('./base.js');
const testResultModel = require('../models/testResult.js');
const dailyBuildStatistics = require('../models/dailyBuildStatistics.js');
class interfaceColController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.testResultModel = yapi.getInst(testResultModel);
    this.dailyBuildStatistics = yapi.getInst(dailyBuildStatistics);
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
  async findProjectTestResult(ctx) {
    try {
      let params = ctx.request.query;
      let res = await this.dailyBuildStatistics.findOne(params);
      if (res) {
        ctx.body = yapi.commons.resReturn(res);
      } else {
        ctx.body = yapi.commons.resReturn(null, 402, '错误');
      }
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }
  async getAllResult(ctx) {
    try {
      let res = await this.dailyBuildStatistics.findAll();
      if (res) {
        _.map(res, (val, index) => {
          _.map(val.details, item => {
            if (val.project.length > 0) {
              _.set(val, 'name', val.project[0].name);
            }
            if (val.daily == item.daily) {
              _.set(res, index, {
                ...val,
                ...item
              });
              return;
            }
          });
        });
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
