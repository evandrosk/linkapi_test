'use strict';

const Logger = {};

Logger.log = async (request = [], response = [], type = 'log') => {
    try {
        if (request.path && request.path === '/') {
            return false; // Ignore log from /
        }
        if (request.body && request.body.senha) {
            request.body.senha = '********';
        }
        if (request.params && request.params.arquivo) {
            request.params.arquivo = 'binary';
        }
        if (request.body && request.body.arquivo) {
            request.body.arquivo = 'binary';
        }
        if (request.path && request.path.toString().indexOf('/download') > -1) {
            response.body = 'binary';
        }
        if (request.headers && request.headers.authorization) {
            request.headers.authorization = '********';
        }
    } catch (e) {
        console.log(e);
    }
};

Logger.trace = async (request = [], data = []) => {
    Logger.log(request, data, 'trace');
};

Logger.error = async (request = [], data = []) => {
    Logger.log(request, data, 'error');
};

Logger.info = async (request = [], data = []) => {
    Logger.log(request, data, 'info');
};

module.exports = Logger;
