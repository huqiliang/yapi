import React, { PureComponent as Component } from 'react';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import './View.scss';
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
      testData: {}
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
        testData: res.data.data
      });
    }
  }

  render() {
    const { testData } = this.state;
    return (
      <div className="caseContainer panel-view">
        <h2 className="interface-title" style={{ marginTop: 0 }}>
          测试结果
        </h2>
        {!_.isEmpty(testData) ? (
          <div className="colHalf">
            <Row className="row">
              <Col span={4} className="colKey">
                更新时间:
              </Col>
              <Col span={8} className="colName">
                {moment(parseInt(testData.add_time) * 1000).format(
                  'YYYY-MM-DD hh:mm:ss'
                )}
              </Col>
            </Row>
            <Row className="row">
              <Col span={4} className="colKey">
                状 态:
              </Col>
              <Col span={8} className="colName">
                {testData.status == 'success' ? (
                  <span>成功</span>
                ) : (
                  <span>失败</span>
                )}
              </Col>
            </Row>
            <Row className="row">
              <Col span={4} className="colKey">
                使用环境:
              </Col>
              <Col span={8} className="colName">
                {testData.env}
              </Col>
            </Row>
            <Row className="row">
              <Col span={4} className="colKey">
                log:
              </Col>
              <Col span={8} className="colName">
                <a target="_blank" href={testData.log}>
                  查看log
                </a>
              </Col>
            </Row>
            <Row className="row">
              <Col span={4} className="colKey">
                jmx:
              </Col>
              <Col span={8} className="colName">
                <a target="_blank" href={testData.jmx}>
                  查看jmx
                </a>
              </Col>
            </Row>
            <Row className="row">
              <Col span={4} className="colKey">
                html:
              </Col>
              <Col span={8} className="colName">
                <a target="_blank" href={testData.html}>
                  查看html
                </a>
              </Col>
            </Row>
          </div>
        ) : (
          <p>暂无测试结果</p>
        )}
      </div>
    );
  }
}
