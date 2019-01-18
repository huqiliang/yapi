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
      let res = await this.dailyBuildStatistics.findOneAll(params);
      let nearly = await this.dailyBuildStatistics.findOneNearly(params);
      const start = params.start
        ? parseInt(params.start.replace(/-/g, ''))
        : null;
      const end = params.end ? parseInt(params.end.replace(/-/g, '')) : null;
      if (res) {
        let obj = {
          nearly,
          data: []
        };
        if (start) {
          _.map(res, val => {
            if (val.daily) {
              let num = parseInt(val.daily);
              if (num >= start && num <= end) {
                obj.data.push(val);
              }
            }
          });
        } else {
          obj.data = res;
        }

        ctx.body = yapi.commons.resReturn(obj);
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
      console.log('====================================');
      console.log(res);
      console.log('====================================');
      if (res && res.length > 0) {
        _.map(res, (val, index) => {
          if (_.has(val, 'project') && val.project.length > 0) {
            _.map(val.details, item => {
              _.set(val, 'name', val.project[0].name);
              if (val.daily == item.daily) {
                _.set(res, index, {
                  ...val,
                  ...item
                });
              }
            });
          } else {
            res.splice(index, 1);
          }
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
