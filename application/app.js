'use strict';

const config   = require('config');
const restify  = require('restify');
const diretory = require('require-dir');

const moment = require('moment-timezone');
moment.tz.setDefault('America/Sao_Paulo');

const server = restify.createServer({
    name: config.get('server.name'),
    version: config.get('server.version')
});

global.to = require('./lib/promiseWrapper.js').to;
global.messageReturn = require('./lib/httpMessage.js').messageReturn;

server.use(restify.plugins.throttle({
    burst: 100,  	// Max 10 concurrent requests (if tokens)
    rate: 2,  		// Steady state: 2 request / 1 seconds
    ip: true		// throttle per IP
}));

server.use(restify.plugins.bodyParser({ mapFiles: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.queryParser({ mapParams: false }));
server.use(restify.plugins.gzipResponse());

const router = new (require('restify-router')).Router();
const routes = diretory('./app/routes');
for (const route in routes) {
    if (route === 'index') {
        router.add('/', routes[route]);
    } else {
        router.add(`/${route}`, routes[route]);
    }
}
router.applyRoutes(server);

server.listen(config.get('server.port'), config.get('server.bind'), function () {
    console.log(server.name, 'listening at', server.url);
});

server.on('pre', (req, res) => {
    // Identify User IP
    req.ip = (req.connection.remoteAddress || '').trim();
    if (req.headers['x-real-ip'] && ['127.0.0.1', '::ffff:127.0.0.1'].includes(req.ip)) {
        req.ip = req.headers['x-real-ip'];
        if (req.headers['x-forwarded-for']) {
            const forwarded = req.headers['x-forwarded-for'].split(',').reverse();
            for (const f in forwarded) {
                if (forwarded[f].trim() !== req.headers['x-real-ip']) {
                    req.ip = forwarded[f].trim();
                    break;
                }
            }
        }
    }
});

// CronJobs Service
const CronJob = require('cron').CronJob;
const crons = diretory('./crons');
for (const c in crons) {
    try {
        const cronFunc = crons[c];
        if (cronFunc.enabled && cronFunc.executionTime) {
            console.log('[CronJob] Loading job:', c);
            var job = new CronJob(cronFunc.executionTime, () => {
                try {
                    cronFunc.run();
                } catch (e) {
                    console.log(`[CronJob] Job (${c}) run error:`, e);
                }
            }, null, true, 'America/Sao_Paulo');
            job.start();
        }
    } catch (e) {
        console.log(`[CronJob] Job (${c}) error:`, e);
    }
}
