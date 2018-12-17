const koaRouter = require('koa-router');
const interfaceController = require('./controllers/interface.js');
const openController = require('./controllers/open.js');
const yapi = require('./yapi.js');

const router = koaRouter();
const { createAction } = require('./utils/commons.js');

let pluginsRouterPath = [];

function addPluginRouter(config) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error('Plugin Route config Error');
  }
  let method = config.method || 'GET';
  let routerPath = '/ws_plugin/' + config.path;
  if (pluginsRouterPath.indexOf(routerPath) > -1) {
    throw new Error('Plugin Route path conflict, please try rename the path');
  }
  pluginsRouterPath.push(routerPath);
  createAction(
    router,
    '/api',
    config.controller,
    config.action,
    routerPath,
    method,
    true
  );
}

function websocket(app) {
  createAction(
    router,
    '/api',
    interfaceController,
    'solveConflict',
    '/interface/solve_conflict',
    'get'
  );
  createAction(
    router,
    '/api',
    openController,
    'runLvYunSingleTest',
    '/open/run_lvyun_single_test',
    'get',
    true
  );
  console.log('====================================');
  console.log(addPluginRouter);
  console.log('====================================');
  yapi.emitHookSync('add_ws_router', addPluginRouter);

  app.ws.use(router.routes());
  app.ws.use(router.allowedMethods());
  app.ws.use(function(ctx, next) {
    return ctx.websocket.send(
      JSON.stringify({
        errcode: 404,
        errmsg: 'No Fount.'
      })
    );
  });
}

module.exports = websocket;
