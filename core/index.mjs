import curry from './curry.mjs';
import debug from './debug.mjs';
import filler from './filler.mjs';
import pipe2 from './pipe2.mjs';
import pipeN from './pipeN.mjs';
import syncPipe2 from './syncPipe2.mjs';
import syncPipeN from './syncPipeN.mjs';
import  proxr from './proxr.mjs';
import * as typers from './typeChecker.mjs';


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


export default core;