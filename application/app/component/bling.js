'use strict';

const config = require('config');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const mongo = require('../../lib/mongo.js');

const Component = {};

Component.getOrder = async (id) => {
    try {
        return await fetch(`${config.get('bling.url')}/pedido/${id}/json`
            + `?apikey=${config.get('bling.key')}`, {
            method: 'GET',
            timeout: 15000
        })
            .then((resp) => {
                return resp.json();
            })
            .then((resp) => {
                return resp.retorno.pedidos ? resp.retorno.pedidos[0].pedido : resp.retorno;
            })
            .catch((e) => {
                console.log('[Bling] Fail fetch', e.message);
                return [];
            });
    } catch (e) {
        console.log('[Bling] getDeals Error:', e);
        return [];
    }
};

Component.setOrder = async (data = {}) => {
    try {
        const xmlData = (`<?xml version="1.0" encoding="UTF-8"?>
            <pedido>
                <cliente>
                    <nome>${data.name}</nome>
                    <tipoPessoa>${data.type}</tipoPessoa>
                    <fone>${data.phone}</fone>
                    <email>${data.email}</email>
                </cliente>
                <itens>
                ${data.items.map((item) => `
                    <item>
                        <codigo>${item.id}</codigo>
                        <descricao>${item.description}</descricao>
                        <qtde>${item.amount}</qtde>
                        <vlr_unit>${item.value}</vlr_unit>
                    </item>
                `)}
                </itens>
                <obs>${data.observation}</obs>
                <obs_internas>${data.internal}</obs_internas>
            </pedido>`);
        return await fetch(`${config.get('bling.url')}/pedido/json`
            + `?apikey=${config.get('bling.key')}`
            + `&xml=${encodeURIComponent(xmlData)}`, {
            method: 'POST',
            timeout: 15000
        })
            .then((resp) => {
                return resp.json();
            })
            .then(async (resp) => {
                if (resp && resp.retorno && resp.retorno.pedidos && resp.retorno.pedidos[0].pedido) {
                    await mongo.update('orders', {
                        date: moment(data.date).format('YYYY-MM-DD')
                    }, {
                        '$inc': { value: data.value }
                    });
                    return resp.retorno.pedidos[0].pedido;
                }
                return resp.retorno;
            })
            .catch((e) => {
                console.log('[Bling] Fail fetch', e.message);
                return null;
            });
    } catch (e) {
        console.log('[Bling] getDeals Error:', e);
        return [];
    }
};

module.exports = Component;
