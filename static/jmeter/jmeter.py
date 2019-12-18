#!/usr/bin/env python3
# coding: utf-8

import os
import sys
from libs.zpjUtils import ZpjUtils
import logging
import json
import argparse
import csv
import xml.etree.ElementTree as ET
import shutil


def step_git(git_url):
    curPath = git_base_path

    path = ""
    path = git_url[git_url.find("://") + 3:]
    path = path[path.find("/") + 1:]
    p_path = os.path.join(curPath, path[0: path.rfind("/")])
    if not (os.path.exists(p_path)):
        os.makedirs(p_path)
    os.chdir(p_path)
    project_name = path[path.rfind("/") + 1: path.rfind(".")]
    project_path = os.path.join(p_path, project_name)
    utils.git_checkout(project_path, project_name, git_url)
    return project_path


def step_jmeter():

    log_file = result_dist["csv"]
    html_path = result_dist["html"]

    case_jmx_file = result_dist["jmx"]

    cmd = "jmeter -n" +  \
        " -t" + case_jmx_file +   \
        " -l" + log_file +  \
        " -e -o" + html_path

    utils.exec_cmd(cmd)
    logging.info('测试用例: ' + case_jmx_file)
    logging.info('测试结果: ' + log_file)
    logging.info('测试报告: ' + html_path + '/index.html')
    
    if step_status(log_file):
        logging.info("测试鉴定: 成功")
        result_dist["status"] = "success"
    else:
        logging.error("测试鉴定: 失败")
        result_dist["status"] = "failure"

def alter_jmx():
    try:
        tree = ET.parse(jmx_path)
        root = tree.getroot()
        for argument in root[0][1][0][0]:
            if argument.attrib['name'] == 'protocol':
                for prop in argument:
                    if prop.attrib['name'] == 'Argument.value':
                        prop.text = protocol
            if argument.attrib['name'] == 'url' :
                for prop in argument:
                    if prop.attrib['name'] == 'Argument.value':
                        prop.text = url
        tree.write(result_dist["jmx"], encoding="utf-8")
    except Exception as e:
        logging.error(e)
        
def step_status(csv_file):
    file_object = open(csv_file, 'r', encoding='UTF-8')
    try:
        for line in file_object:
            row = line.split(',')
            if row[7] == 'false':
                return False
    except Exception as e:
        logging.error(e)
        return False
    finally:
        file_object.close()
    return True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="""
        绿云研发中心，jmeter自动化执行工具;
        """
    )
    parser.add_argument('-u', '--url', type=str, nargs="?",
                        help="测试或正式环境地址比如https://api.ihotel.cn")
    parser.add_argument('-g', '--git', type=str,
                        nargs="?", help="测试用例的git项目地址")
    parser.add_argument('-p', '--path', type=str,
                        nargs="?", help="jmx所在git项目中的路径")
    parser.add_argument('-o', '--output', type=str,
                        nargs="?", help="测试报表的输出目录")
    args = parser.parse_args()

    url = ""
    git_url = ""
    jmx_git_path = ""
    output = ""
    result_dist = {"status": "failure","csv": "","log": "","jmx":"", "html" :""}
    if args.url:
        url = str(args.url).strip()
    else:
        print(u"缺少参数-u | --url")
        sys.exit(0)

    if args.git:
        git_url = str(args.git).strip()
    else:
        print(u"缺少参数-g | --git")
        sys.exit(0)

    if args.path:
        jmx_git_path = str(args.path).strip()
        jmx_git_path = jmx_git_path[1:]
    else:
        print(u"缺少参数-p | --path")
        sys.exit(0)

    if args.output:
        output = str(args.output).strip()
    else:
        print(u"缺少参数-o | --output")
        sys.exit(0)

    utils = ZpjUtils()
    basepath = os.path.dirname(__file__)
    project_id = output.split('/')[0]
    git_base_path = os.path.join(basepath, project_id)
    case_base_path = os.path.join(basepath, output)
    if os.path.exists(case_base_path):
        shutil.rmtree(case_base_path)
    os.makedirs(case_base_path)
    
    target = jmx_git_path[0 : jmx_git_path.find(".")].replace('/','_').replace('{','').replace('}','')
    log_file = os.path.join(case_base_path,  target + ".log")
    result_dist["log"] = log_file
    utils.begin_log(log_file)

    protocol = url[0: url.find("://")]
    url = url[url.find("://") + 3:]
    if url.find("/") != -1:
        url = url[0: url.find("/")]
    if git_url.find("ssh://") == 0:
        pass
    else:
        git_url = git_url[0: git_url.find(
            "://") + 3] + "zpj:pujun3242@" + git_url[git_url.find("://") + 3:]

    #{"status": "success","csv": "","log": "","jmx": ""}
    result_dist["csv"] = os.path.join(case_base_path, target + '.csv')
    result_dist["html"] = os.path.join(case_base_path, "html")
    result_dist["jmx"] = os.path.join(case_base_path, target + '.jmx')
    
    git_path = step_git(git_url)
    jmx_path = os.path.join(git_path, jmx_git_path)
        
    if not (os.path.exists(jmx_path)):
        print(jmx_path + " 指定git目录下的文件不存在")
        sys.exit(0)
    alter_jmx()
    step_jmeter()

    logging.info('测试日志: ' + log_file)
    utils.end_log()
    basepath = os.path.dirname(basepath)
    result_dist["html"] = result_dist["html"] + '/index.html'
    for key in result_dist:
        result_dist[key] = result_dist[key].replace(basepath, 'https://yapi.ihotel.cn').replace('\\','/')
    print(json.dumps(result_dist))    
