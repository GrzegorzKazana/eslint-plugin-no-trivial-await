'use strict';

module.exports = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then.',
        },
    },
    create: function (context) {
        return {};
    },
};
