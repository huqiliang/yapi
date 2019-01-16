import React, { Component } from 'react';
// import { PieChart, Pie, Sector, Cell } from 'recharts';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
// import _ from 'lodash';
// const COLORS = ['#00C49F', '#FF8042'];
@connect(state => {
  return {
    project: state.project.currProject
  };
})
class ProjectTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      activeIndex: 0,
      activeIndex2: 0
    };
  }
  static propTypes = {
    project: PropTypes.object
  };
  async componentWillMount() {
    let res = await axios.get('/api/testResult/findProjectTestResult', {
      params: {
        project_id: this.props.project._id
      }
    });
    if (res && res.data && res.data.errcode == 0) {
      let data = res.data.data;
      this.setState({
        data
      });
    }
  }

  onPieEnter(data, index) {
    this.setState({
      activeIndex: index
    });
  }

  onPieEnter2(data, index) {
    this.setState({
      activeIndex2: index
    });
  }
  render() {
    const { data } = this.state;

    return (
      <div className="project-token">
        <h2 className="token-title">最近测试结果</h2>
        <div className="message">
          <p>测试时间: {data.daily}</p>
        </div>
        <div className="message">
          <p>测试结果: {data.remark}</p>
        </div>
        <h2 className="token-title">详细信息</h2>
        <div className="token" />
      </div>
    );
  }
}
export default ProjectTest;
