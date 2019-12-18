#!/usr/bin/python
# -*- coding: UTF-8 -*-

import logging
import datetime
import smtplib
import os
import subprocess

class ZpjUtils(object):
    '''
    一个工具类
    '''

    def __init__(self):
        '''
        Constructor
        '''

    begin_work_time = datetime.datetime.now()
    smtp = None

    def begin_log(self, filename):
        # 配置日志信息
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s',
                            datefmt='%a, %d %b %Y %H:%M:%S',
                            filename=filename,
                            filemode='w')
        # 定义一个Handler打印INFO及以上级别的日志到sys.stderr
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        formatter = logging.Formatter('%(levelname) -8s: %(message)s')
        console.setFormatter(formatter)
        logging.getLogger('').addHandler(console)
        logging.info(u"现在时间是  " + self.begin_work_time.strftime("%Y-%m-%d %H:%M:%S"))
    
    def end_log(self):
        self.calc_time_diff(self.begin_work_time)

    def calc_time_diff(self,begin_time):
        logging.info(u"---- 开始时间：" + begin_time.strftime("%Y-%m-%d %H:%M:%S") + " ----")
        logging.info(u"---- 结束时间：" + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " ----")
        a = datetime.datetime.now() - begin_time
        b = a.seconds
        d = int(b / 86400)
        h = int(b % 86400 / 3600)
        m = int(b % 3600 / 60)
        s = b % 60
        logging.info(u"---- 耗时：" + str(d) + u"天" + str(h) + u"小时" + str(m) + u"分钟" + str(s) + u"秒 ----")

    def smtp_config(self, mail_host="smtp.ym.163.com", mail_user="postmaster@ipms.cn", mail_pass="deviskaifa"):
        try:
            self.smtp = smtplib.SMTP() 
            self.smtp.connect(mail_host, 25)
            self.smtp.login(mail_user,mail_pass)  
            
        except self.smtp.SMTPException:
            logging.error("Error: 无法登录邮箱")

    '''
    cmdstr：命令行
    is_logger_out：是否输出日志，默认为True
    返回值：0为正常，其他为异常
    '''
    def exec_cmd(self, cmdstr, is_logger_out=True):
        logging.info(cmdstr)
        if is_logger_out == False:
            ret = os.system(cmdstr)
            if ret == 0:
                logging.info(cmdstr + "命令执行完成")
            else:
                logging.error(cmdstr + "命令执行出错")
        else:
            p = subprocess.Popen(cmdstr, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            while True:
                buff = p.stdout.readline()
                if len(buff) == 0 and p.poll() != None:
                    break
                buff = buff.strip()
                if len(buff) != 0 :
                    logging.info(buff.strip())
            ret = p.returncode
            if ret == 0 :
                logging.info(cmdstr + "命令执行完成")
            else:
                logging.error(cmdstr + "命令执行出错")
        return ret

    '''
    project_path：获取项目后存放的目录
    project_name：项目名
    git_url：git地址
    '''
    def git_checkout(self, project_path, project_name, git_url):
        if not (os.path.exists(project_path)):
            self.exec_cmd("git clone " + git_url)
        else:
            current_path = os.getcwd()
            os.chdir(project_name)
            try:
                self.exec_cmd("git checkout && git clean -xdf")
                self.exec_cmd("git pull")
            except:
                pass
            finally:
                os.chdir(current_path)

    '''
    pom_file: pom.xml
    '''
    def mvn_package(self, pom_file, need_test = False):
       # pom_file = os.path.join(project_path, "pom.xml")
        ret = 0
        if os.path.exists(pom_file) :
            if need_test :
                test_flag = "False"
            else:
                test_flag = "True"
            ret = self.exec_cmd("mvn clean install -Dmaven.test.skip=" + test_flag + " -f " + pom_file)
        else :
            logging.debug(pom_file + "找不到")
        return ret

    '''
    project_path：项目目录
    '''
    def sonar(self, project_path, project_key):
        current_path = os.getcwd()
        sonar_properties_file = os.path.join(project_path, "sonar-project.properties")
        cmdstr = ""
        if os.path.exists(sonar_properties_file) :
            logging.info(u"项目自带 sonar-project.properties")
            cmdstr = "sonar-scanner"
        else:
            cmdstr = "sonar-scanner -Dsonar.projectKey=" + project_key + " -Dsonar.sources=. -Dsonar.java.binaries=./target/classes"

        os.chdir(project_path)
        class_path = os.path.join(project_path, "target/classes")
        if not (os.path.exists(class_path)):
            os.makedirs(class_path)
        ret = self.exec_cmd(cmdstr)
        os.chdir(current_path)
        return ret

