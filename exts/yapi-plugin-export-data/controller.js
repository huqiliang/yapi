const baseController = require("controllers/base.js");
const interfaceModel = require("models/interface.js");
const projectModel = require("models/project.js");
// const wikiModel = require('../yapi-plugin-wiki/wikiModel.js');
const interfaceCatModel = require("models/interfaceCat.js");
const yapi = require("yapi.js");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItTableOfContents = require("markdown-it-table-of-contents");
const defaultTheme = require("./defaultTheme.js");
const md = require("../../common/markdown");

// const htmlToPdf = require("html-pdf");
class exportController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.catModel = yapi.getInst(interfaceCatModel);
    this.interModel = yapi.getInst(interfaceModel);
    this.projectModel = yapi.getInst(projectModel);
  }

  async handleListClass(pid, status) {
    let result = await this.catModel.list(pid),
      newResult = [];
    for (let i = 0, item, list; i < result.length; i++) {
      item = result[i].toObject();
      list = await this.interModel.listByInterStatus(item._id, status);
      list = list.sort((a, b) => {
        return a.index - b.index;
      });
      if (list.length > 0) {
        item.list = list;
        newResult.push(item);
      }
    }

    return newResult;
  }

  handleExistId(data) {
    function delArrId(arr, fn) {
      if (!Array.isArray(arr)) return;
      arr.forEach(item => {
        delete item._id;
        delete item.__v;
        delete item.uid;
        delete item.edit_uid;
        delete item.catid;
        delete item.project_id;

        if (typeof fn === "function") fn(item);
      });
    }

    delArrId(data, function(item) {
      delArrId(item.list, function(api) {
        delArrId(api.req_body_form);
        delArrId(api.req_params);
        delArrId(api.req_query);
        delArrId(api.req_headers);
        if (api.query_path && typeof api.query_path === "object") {
          delArrId(api.query_path.params);
        }
      });
    });

    return data;
  }

  async exportData(ctx) {
    let pid = ctx.request.query.pid;
    let type = ctx.request.query.type;
    let status = ctx.request.query.status;
    let isWiki = ctx.request.query.isWiki;

    if (!pid) {
      ctx.body = yapi.commons.resReturn(null, 200, "pid 不为空");
    }
    let curProject, wikiData;
    let tp = "";
    try {
      curProject = await this.projectModel.get(pid);
      if (isWiki === "true") {
        const wikiModel = require("../yapi-plugin-wiki/wikiModel.js");
        wikiData = await yapi.getInst(wikiModel).get(pid);
      }
      ctx.set("Content-Type", "application/octet-stream");
      const list = await this.handleListClass(pid, status);

      switch (type) {
        case "markdown": {
          tp = await createMarkdown.bind(this)(list, false);
          ctx.set("Content-Disposition", `attachment; filename=api.md`);
          return (ctx.body = tp);
        }
        case "json": {
          let data = this.handleExistId(list);
          tp = JSON.stringify(data, null, 2);
          ctx.set("Content-Disposition", `attachment; filename=api.json`);
          return (ctx.body = tp);
        }
        default: {
          //默认为html
          tp = await createHtml.bind(this)(list);
          ctx.set("Content-Disposition", `attachment; filename=api.html`);
          return (ctx.body = tp);
        }
      }
    } catch (error) {
      yapi.commons.log(error, "error");
      ctx.body = yapi.commons.resReturn(null, 502, "下载出错");
    }

    async function createHtml(list) {
      let md = await createMarkdown.bind(this)(list, true);
      let markdown = markdownIt({ html: true, breaks: true });
      markdown.use(markdownItAnchor); // Optional, but makes sense as you really want to link to something
      markdown.use(markdownItTableOfContents, {
        markerPattern: /^\[toc\]/im
      });

      // require('fs').writeFileSync('./a.markdown', md);
      let tp = unescape(markdown.render(md));
      // require('fs').writeFileSync('./a.html', tp);
      let left;
      // console.log('tp',tp);
      let content = tp.replace(
        /<div\s+?class="table-of-contents"\s*>[\s\S]*?<\/ul>\s*<\/div>/gi,
        function(match) {
          left = match;
          return "";
        }
      );

      return createHtml5(left || "", content);
    }

    function createHtml5(left, tp) {
      //html5模板
      let html = `<!DOCTYPE html>
      <html>
      <head>
      <title>${curProject.name}</title>
      <meta charset="utf-8" />
      ${defaultTheme}
      </head>
      <body>
        <div class="m-header">
          <a href="#" style="display: inherit;"><img src="data:image/png;base64,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"/></a>
          <a href="#"><h1 class="title">${
            curProject.name
          } -- 绿云接口文档</h1></a>
          <div class="nav">
            <a href="http://www.ihotel.cn/">GreenCloud</a>
          </div>
        </div>
        <div class="g-doc">
          ${left}
          <div id="right" class="content-right">
          ${tp}
            <footer class="m-footer">
              <p>Build by <a href="http://www.ihotel.cn/">GCFE</a>.</p>
            </footer>
          </div>
        </div>
      </body>
      </html>
      `;
      return html;
    }

    function createMarkdown(list, isToc) {
      //拼接markdown
      //模板
      let mdTemplate = ``;
      try {
        // 项目名称信息
        mdTemplate += md.createProjectMarkdown(curProject, wikiData);
        // 分类信息
        mdTemplate += md.createClassMarkdown(curProject, list, isToc);
        return mdTemplate;
      } catch (e) {
        yapi.commons.log(e, "error");
        ctx.body = yapi.commons.resReturn(null, 502, "下载出错");
      }
    }
  }
}

module.exports = exportController;
