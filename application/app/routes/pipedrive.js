'use strict';

const config = require('config');
const moment = require('moment-timezone');
const router = new (require('restify-router')).Router();
const comp = require('../component/pipedrive.js');
moment.tz.setDefault('America/Sao_Paulo');

router.use(async (req, res, next) => {
    if (req.headers['x-api-key'] !== config.get('server.secret')) {
        res.json(401, {
            erro: true,
            mensagem: 'Acesso negado.'
        });
        return next(false);
    }
    next();
});

router.get('/', async (req, res, next) => {
    res.send(404);
    next();
});

router.get('/deals', async (req, res, next) => {
    try {
        const resp = await comp.getDeals();
        await res.send(200, {
            success: resp ? true : false,
            options: { params: req.params, query: req.query, body: req.body },
            data: resp
        });
    } catch (e) {
        res.send(500, { error: true, message: e.message || e });
    }
    next();
});

router.get('/deal/:id', async (req, res, next) => {
    try {
        const resp = await comp.getDeal(req.params.id);
        await res.send(200, {
            success: resp ? true : false,
            options: { params: req.params, query: req.query, body: req.body },
            data: resp
        });
    } catch (e) {
        res.send(500, { error: true, message: e.message || e });
    }
    next();
});

router.get('/syncOrderBling/:id', async (req, res, next) => {
    try {
        const resp = await comp.syncOrderBling(req.params.id);
        await res.send(200, {
            success: resp ? true : false,
            options: { params: req.params, query: req.query, body: req.body },
            data: resp
        });
    } catch (e) {
        res.send(500, { error: true, message: e.message || e });
    }
    next();
});

module.exports = router;
