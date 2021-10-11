'use strict';

const messageReturn = function messageReturn(message, code) {
    return {
        error: {
            details: [message]
        },
        code: code
    };
};

module.exports = {
    messageReturn
};
