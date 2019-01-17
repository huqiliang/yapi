import React, { Component } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import PropTypes from 'prop-types';
import axios from 'axios';
import { DatePicker, Button } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
// import _ from 'lodash';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const today = moment().format(dateFormat);
const tomorrow = moment()
  .add(1, 'd')
  .format(dateFormat);
@connect(state => {
  return {
    project: state.project.currProject
  };
})
class ProjectTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nearly: {},
      data: [],
      selectDate: [today, tomorrow]
    };
  }
  static propTypes = {
    project: PropTypes.object
  };
  componentWillMount() {
    this.search();
  }
  async search(params) {
    let res = await axios.get('/api/testResult/findProjectTestResult', {
      params: {
        project_id: this.props.project._id,
        ...params
      }
    });
    if (res && res.data && res.data.errcode == 0) {
      let data = res.data.data.data;
      let nearly = res.data.data.nearly;

      this.setState({
        nearly,
        data
      });
    }
  }
  render() {
    const { data, nearly } = this.state;
    return (
      <div className="project-token">
        <h2 className="token-title">最近测试结果</h2>
        {nearly && nearly.length > 0 ? (
          <div>
            <div className="message">
              <p>测试时间: {nearly[0].daily}</p>
            </div>
            <div className="message">
              <p>测试结果: {nearly[0].remark}</p>
            </div>
          </div>
        ) : (
          '无最新测试结果'
        )}
        <h2 className="token-title" style={{ marginTop: '20px' }}>
          详细信息
        </h2>
        <div
          style={{ width: '400px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <RangePicker
            onChange={(momentDate, selectDate) => {
              this.setState({
                selectDate
              });
            }}
            style={{
              marginRight: '10px',
              verticalAlign: 'middle'
            }}
            defaultValue={[
              moment(today, dateFormat),
              moment(tomorrow, dateFormat)
            ]}
            format={dateFormat}
          />
          <Button
            type="primary"
            onClick={() => {
              let [start, end] = this.state.selectDate;
              this.search({ start, end });
            }}
          >
            查询
          </Button>
        </div>
        <div
          className="token"
          style={{ width: '1300px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {data && data.length > 0 ? (
            <LineChart
              width={1200}
              height={500}
              data={data}
              margin={{ top: 5, right: 50, left: 50, bottom: 5 }}
            >
              <XAxis dataKey="daily" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                name="完成率"
                dataKey="finishing_rate"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                name="通过率"
                dataKey="passing_rate"
                stroke="#82ca9d"
              />
            </LineChart>
          ) : (
            <span>无测试结果</span>
          )}
        </div>
      </div>
    );
  }
}
export default ProjectTest;
