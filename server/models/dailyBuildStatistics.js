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
  findAll() {
    return this.model
      .aggregate()
      .group({
        _id: '$project_id',
        daily: { $max: '$daily' }
      })
      .lookup({
        from: 'daily_build_statistics',
        localField: '_id',
        foreignField: 'project_id',
        as: 'details'
      })
      .lookup({
        from: 'project',
        localField: '_id',
        foreignField: '_id',
        as: 'project'
      })
      .match({ details: { $ne: [] } });
  }
  findOne(params) {
    return this.model.findOne({
      project_id: params.project_id
    });
  }
}

module.exports = dailyBuildStatistics;
