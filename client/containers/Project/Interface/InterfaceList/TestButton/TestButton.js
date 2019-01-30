import React, { PureComponent as Component } from "react";
import { Modal, Spin, Tooltip, Button, message } from "antd";
import _ from "lodash";
import PropTypes from "prop-types";
export default class Run extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testModal: false,
      testData: ""
    };
  }
  static propTypes = {
    currentProject: PropTypes.object,
    type: PropTypes.string,
    currentInterface: PropTypes.object
  };
  sendTest() {
    const { currentProject, currentInterface } = this.props;
    console.log("====================================");
    console.log(currentInterface);
    console.log("====================================");
    if (_.isEmpty(currentProject.testPath)) {
      message.error("请配置全局测试地址");
    } else {
      if (!/^ssh:\/\/.*$/.test(currentProject.testPath)) {
        message.error("全局测试地址必须是ssh的");
      } else {
        this.setState({
          testModal: true
        });
        let domain =
          location.hostname + (location.port !== "" ? ":" + location.port : "");
        //因后端 node 仅支持 ws， 暂不支持 wss
        let wsProtocol = location.protocol === "https:" ? "wss" : "ws";
        // let options = handleParams(this.state, this.handleValue);
        const { _id: id, case_env } = currentInterface;
        console.log("====================================");
        console.log(_.isEmpty(case_env));
        console.log("====================================");
        const env = !_.isEmpty(case_env) ? "&env=" + case_env : "";
        console.log("====================================");
        console.log(env);
        console.log("====================================");
        const projectId = currentInterface.project_id;
        const ws = new WebSocket(
          wsProtocol +
            "://" +
            domain +
            "/api/open/run_lvyun_single_test?projectId=" +
            projectId +
            "&interFasceId=" +
            id +
            env
        );
        ws.onopen = () => {
          this.setState({
            webSocketOpen: true
          });
          ws.send("beginTest");
        };

        ws.onmessage = e => {
          this.setState({
            testData: JSON.parse(e.data),
            webSocketOpen: false
          });
        };
        ws.onclose = () => {
          console.log("websocket close");
          this.setState({
            webSocketOpen: false
          });
        };
      }
    }
  }
  render() {
    const { type } = this.props;
    const { testModal, testData } = this.state;
    return (
      <div>
        {type === "inter" ? (
          <Tooltip placement="bottom" title={"绿云测试"}>
            <Button
              style={{ marginLeft: 10 }}
              type="primary"
              onClick={this.sendTest.bind(this)}
            >
              测试
            </Button>
          </Tooltip>
        ) : null}
        {testModal && (
          <Modal
            className="testModal"
            width={680}
            onCancel={() => {
              if (!this.state.webSocketOpen) {
                this.setState({
                  testModal: false,
                  testData: ""
                });
              }
            }}
            footer={null}
            title="测试结果"
            visible={testModal}
          >
            {!testData ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <Spin />
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "10px"
                  }}
                >
                  正在跑测试用例,请不要刷新浏览器或关闭窗口
                </div>
              </div>
            ) : testData.errCode === 0 ? (
              <span>出错了:{testData.stdout}</span>
            ) : (
              <div>
                <p>
                  <span>测试状态:</span>
                  {testData.status}
                </p>
                <p>
                  <span>测试日志:</span>
                  <a target="_blank" href={testData.log}>
                    点我
                  </a>
                </p>
                <p>
                  <span>测试jmx:</span>
                  <a target="_blank" href={testData.jmx}>
                    点我
                  </a>
                </p>
                <p>
                  <span>测试结果:</span>
                  <a target="_blank" href={testData.html}>
                    点我
                  </a>
                </p>
              </div>
            )}
          </Modal>
        )}
      </div>
    );
  }
}
