const baseModel = require('./base.js');

class testResult extends baseModel {
  getName() {
    return 'testResult';
  }

  getSchema() {
    return {
      project_id: {
        type: String,
        required: true
      },
      interface_id: {
        type: String,
        required: true
      },
      uid: {
        type: String,
        required: true
      },
      status: {
        type: String,
        required: true,
        default: false
      },
      env: {
        type: String
      },
      log: {
        type: String
      },
      jmx: {
        type: String
      },
      html: {
        type: String
      },
      csv: {
        type: String
      },
      add_time: {
        type: String
      }
    };
  }

  save(data) {
    let test = new this.model(data);
    return test.save();
  }

  list() {
    return this.model
      .find()
      .select('_id username email role type  add_time up_time study')
      .exec(); //显示id name email role
  }

  listWithPaging(page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.model
      .find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('_id username email role type  add_time up_time study')
      .exec();
  }

  listCount() {
    return this.model.countDocuments();
  }

  findSection(params) {
    return this.model
      .findOne({
        project_id: params.project_id,
        interface_id: params.interface_id
      })
      .exec();
  }

  del(id) {
    return this.model.remove({
      _id: id
    });
  }

  update(id, data) {
    return this.model.update(
      {
        _id: id
      },
      data
    );
  }
}

module.exports = testResult;
