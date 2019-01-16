import React, { PureComponent as Component } from 'react';
import { Table } from 'antd';
import '../GroupList/GroupList.scss';
import Axios from 'axios';

export default class TestResultList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
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
  render() {
    const columns = [
      {
        title: '项目id',
        dataIndex: 'project_id'
      },
      {
        title: '项目名称',
        dataIndex: 'name'
      },
      {
        title: '完成率',
        dataIndex: 'finishing_rate'
      },
      {
        title: '通过率',
        dataIndex: 'passing_rate'
      },
      {
        title: '时间',
        dataIndex: 'daily'
      },
      {
        title: '备注',
        dataIndex: 'remark'
      }
    ];

    const { data } = this.state;
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
          bordered
        />
      </div>
    );
  }
}
