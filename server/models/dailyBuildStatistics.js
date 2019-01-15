const baseModel = require('./base.js');

class dailyBuildStatistics extends baseModel {
  getName() {
    return 'daily_build_statistics';
  }

  getSchema() {
    return {
      _id: {
        type: String,
        required: true
      },
      daily: {
        type: String
      },
      project_id: {
        type: Number,
        required: true
      },
      finishing_rate: {
        type: Number
      },
      passing_rate: {
        type: Number
      },
      remark: {
        type: String
      }
    };
  }

  list() {
    return this.model.find({}).exec(); //显示id name email role
  }

  findOne(params) {
    return this.model.findOne({
      project_id: params.project_id
    });
  }
}

module.exports = dailyBuildStatistics;
