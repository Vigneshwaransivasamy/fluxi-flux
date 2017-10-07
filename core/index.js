const curry = require('./curry');
const debug = require('./debug');
const filler = require('./filler');
const pipe2 = require('./pipe2');
const pipeN = require('./pipeN');
const syncPipe2 = require('./syncPipe2');
const syncPipeN = require('./syncPipeN');
const typers = require('./typeChecker');
const proxr = require('./proxr');


const core = Object.assign({},{
    curry,
    debug,
    filler,
    pipe2,
    pipeN,
    syncPipe2,
    syncPipeN,
    proxr
},typers);

module.exports = core;