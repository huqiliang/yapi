function improtData(importDataModule) {
  if (!importDataModule || typeof importDataModule !== 'object') {
    console.error('importDataModule 参数Must be Object Type');
    return null;
  }

  importDataModule.rap = {
    name: 'RAP',
    desc: 'YApi接口 RAP数据导入'
  };
}

module.exports = function() {
  this.bindHook('import_data', improtData);
};
