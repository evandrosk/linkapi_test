'use strict';

const config = require('config');
const fetch = require('node-fetch');
const bling = require('./bling.js');

const Component = {};

Component.getDeals = async (status = 'won') => {
    try {
        return await fetch(`${config.get('pipedrive.url')}/deals`
            + `?api_token=${config.get('pipedrive.key')}`
            + `&status=${status}`, {
            method: 'GET',
            timeout: 15000
        })
            .then((resp) => {
                return resp.json();
            })
            .then((resp) => {
                // poderia utilizar uma função separada para capturar as demais paginações >100
                // utilizando resp.additional_data.more_items_in_collection para loop
                if (resp && resp.success === true) {
                    return resp.data;
                }
                return [];
            })
            .catch((e) => {
                console.log('[PipeDrive] Fail fetch', e.message);
                return [];
            });
    } catch (e) {
        console.log('[PipeDrive] getDeals Error:', e);
        return [];
    }
};

Component.getDealsProducts = async (id) => {
    try {
        return await fetch(`${config.get('pipedrive.url')}/deals/${id}/products`
            + `?api_token=${config.get('pipedrive.key')}`, {
            method: 'GET',
            timeout: 15000
        })
            .then((resp) => {
                return resp.json();
            })
            .then((resp) => {
                // poderia utilizar uma função separada para capturar as demais paginações >100
                // utilizando resp.additional_data.more_items_in_collection para loop
                if (resp && resp.success === true) {
                    return resp.data;
                }
                return [];
            })
            .catch((e) => {
                console.log('[PipeDrive] Fail fetch', e.message);
                return [];
            });
    } catch (e) {
        console.log('[PipeDrive] getDeals Error:', e);
        return [];
    }
};

Component.getDeal = async (id) => {
    try {
        return await fetch(`${config.get('pipedrive.url')}/deals/${id}`
            + `?api_token=${config.get('pipedrive.key')}`, {
            method: 'GET',
            timeout: 15000
        })
            .then((resp) => {
                return resp.json();
            })
            .then(async (resp) => {
                if (resp && resp.success === true) {
                    resp.data.items = await Component.getDealsProducts(id);
                    return resp.data;
                }
                return {};
            })
            .catch((e) => {
                console.log('[PipeDrive] Fail fetch', e.message);
                return {};
            });
    } catch (e) {
        console.log('[PipeDrive] getDeals Error:', e);
        return {};
    }
};

Component.syncOrderBling = async (id) => {
    try {
        const deal = await Component.getDeal(id);
        if (!deal) {
            return {};
        }
        const data = {
            date: deal.won_time,
            name: deal.org_id && deal.org_id.name ? deal.org_id.name : deal.person_id.name || null,
            type: deal.org_id && deal.org_id.name ? 'J' : 'F',
            phone: deal.person_id.phone.value || null,
            email: deal.person_id.email.value || null,
            items: [],
            value: deal.value || 0,
            observation: deal.title || null,
            internal: null
        };
        for (const item of deal.items) {
            data.items.push({
                id: item.id,
                description: item.name,
                amount: item.quantity,
                value: item.item_price
            });
        }
        return await bling.setOrder(data);
    } catch (e) {
        console.log('[PipeDrive] syncBling Error:', e);
        return [];
    }
};

module.exports = Component;
