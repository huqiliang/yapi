import React, { PureComponent as Component } from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import './TestResult.scss';
@connect(
  state => {
    return {
      curdata: state.inter.curdata,
      currProject: state.project.currProject
    };
  },
  {}
)
export default class TestResult extends Component {
  static propTypes = {
    curdata: PropTypes.object,
    currProject: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      tableData: []
    };
  }
  async componentDidMount() {
    const { curdata } = this.props;
    let params = {
      project_id: curdata.catid,
      interface_id: curdata._id
    };
    let res = await axios.get('/api/testResult/findSection', { params });
    if (res && res.data) {
      this.setState({
        tableData: res.data.data,
        columns: [
          {
            title: '状态',
            dataIndex: 'status',
            render(text) {
              return (
                <p>
                  {text == 'success' ? <span>成功</span> : <span>失败</span>}
                </p>
              );
            }
          },
          {
            title: '使用环境',
            dataIndex: 'env'
          },
          {
            title: 'csv',
            dataIndex: 'csv',
            render: this.link
          },
          {
            title: 'log',
            dataIndex: 'log',
            render: this.link
          },
          {
            title: 'jmx',
            dataIndex: 'jmx',
            render: this.link
          },
          {
            title: 'html',
            dataIndex: 'html',
            render: this.link
          },
          {
            title: '时间',
            dataIndex: 'add_time',
            render(text) {
              return moment(parseInt(text) * 1000).format(
                'YYYY-MM-DD hh:mm:ss'
              );
            }
          }
        ]
      });
    }
  }
  link(text) {
    return (
      <p>
        <a target="_blank" href={text}>
          点我
        </a>
      </p>
    );
  }
  render() {
    const { tableData, columns } = this.state;
    return (
      <div className="testResult">
        <Table
          bordered={true}
          dataSource={tableData}
          columns={columns}
          rowKey="_id"
        />
      </div>
    );
  }
}
