import React, { PureComponent as Component } from 'react';
import { Table } from 'antd';
import '../GroupList/GroupList.scss';
import Axios from 'axios';

export default class TestResultList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      sortInfo: {
        order: 'descend',
        columnKey: 'finishing_rate'
      }
    };
  }
  async componentDidMount() {
    let res = await Axios.get('/api/testResult/getAllResult');
    if (res && res.data && res.data.errcode == 0) {
      this.setState({
        data: res.data.data
      });
    }
  }
  handleChange = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortInfo: sorter
    });
  };
  render() {
    const { data, sortInfo } = this.state;

    const columns = [
      {
        title: '项目id',
        dataIndex: 'project_id'
      },
      {
        title: '项目名称',
        dataIndex: 'project[0].name'
      },
      {
        title: '完成率',
        dataIndex: 'finishing_rate',
        sorter: (a, b) => a.finishing_rate - b.finishing_rate,
        sortOrder: sortInfo.columnKey === 'finishing_rate' && sortInfo.order
      },
      {
        title: '通过率',
        dataIndex: 'passing_rate',
        sorter: (a, b) => a.passing_rate - b.passing_rate,
        sortOrder: sortInfo.columnKey === 'passing_rate' && sortInfo.order
      },
      {
        title: '时间',
        dataIndex: 'daily',
        sorter: (a, b) => a.daily - b.daily,
        sortOrder: sortInfo.columnKey === 'daily' && sortInfo.order
      },
      {
        title: '备注',
        dataIndex: 'remark'
      }
    ];

    return (
      <div
        style={{
          width: '95%',
          marginTop: '20px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <Table
          rowKey="project_id"
          columns={columns}
          dataSource={data}
          onChange={this.handleChange}
          bordered
        />
      </div>
    );
  }
}
