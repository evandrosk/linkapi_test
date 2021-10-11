'use strict';

const router = new (require('restify-router')).Router();

router.get('/', async (req, res, next) => {
    res.json({
        msg: 'Bem vindo a LinkAPI'
    });
    next();
});

router.get('/robots.txt', async (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    // eslint-disable-next-line quotes
    res.send(200, `User-agent: *\nDisallow: /`);
    next();
});

router.get('/favicon.ico', async (req, res, next) => {
    res.setHeader('Content-Type', 'image/webp');
    // eslint-disable-next-line max-len
    res.send(404);
    next();
});

router.get('/ping', async (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(200, 'pong!');
    next();
});

module.exports = router;
