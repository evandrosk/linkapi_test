'use strict';

const cron = {
    enabled: true,
    executionTime: '*/5 * * * *'
};

const pipedrive = require('../app/component/pipedrive.js');

cron.run = async () => {
    console.log('[CRON PipeDrive to Bling]', new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    try {
        if (cron.enabled === false) {
            console.log('[CRON PipeDrive to Bling] aguardando...');
            return;
        }
        cron.enabled = false;
        for (const deal of await pipedrive.getDeals()) {
            await pipedrive.syncOrderBling(deal.id);
        }
        cron.enabled = true;
    } catch (e) {
        console.log('[CRON ERROR]', e);
        cron.enabled = true;
    }
};

module.exports = cron;
