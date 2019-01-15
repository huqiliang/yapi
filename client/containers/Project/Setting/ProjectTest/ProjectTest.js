import React, { Component } from 'react';
import { PieChart, Pie, Sector, Cell } from 'recharts';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import _ from 'lodash';

const renderActiveShape = props => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${value}%`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};
const COLORS = ['#00C49F', '#FF8042'];
renderActiveShape.propTypes = {
  cx: PropTypes.string,
  cy: PropTypes.string,
  midAngle: PropTypes.string,
  innerRadius: PropTypes.string,
  outerRadius: PropTypes.string,
  startAngle: PropTypes.string,
  endAngle: PropTypes.string,
  fill: PropTypes.string,
  payload: PropTypes.string,
  percent: PropTypes.string,
  value: PropTypes.string
};
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
    console.log('====================================');
    console.log(this.props.project._id);
    console.log('====================================');
    let res = await axios.get('/api/testResult/findProjectTestResult', {
      params: {
        project_id: 32 //this.props.project._id
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
    const data01 = [
      { name: '完成率', value: data.finishing_rate },
      { name: '未完成率', value: 100 - data.finishing_rate }
    ];
    const data02 = [
      { name: '通过率', value: data.passing_rate },
      { name: '未通过率', value: 100 - data.passing_rate }
    ];
    return (
      <div className="project-token">
        <h2 className="token-title">测试结果</h2>
        <div className="message">{data.remark}</div>
        <div className="token">
          <span>详细信息:</span>
          {!_.isEmpty(data) ? (
            <div
              style={{
                display: 'flex'
              }}
            >
              <PieChart width={500} height={400}>
                <Pie
                  activeIndex={this.state.activeIndex}
                  data={data01}
                  activeShape={renderActiveShape}
                  onMouseEnter={this.onPieEnter.bind(this)}
                  dataKey="value"
                  cx={200}
                  cy={200}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {data01.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <PieChart width={500} height={400}>
                <Pie
                  activeIndex={this.state.activeIndex2}
                  data={data02}
                  activeShape={renderActiveShape}
                  onMouseEnter={this.onPieEnter2.bind(this)}
                  dataKey="value"
                  cx={300}
                  cy={200}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {data02.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </div>
          ) : (
            <span> 找不到相关结果</span>
          )}
        </div>
      </div>
    );
  }
}
export default ProjectTest;
