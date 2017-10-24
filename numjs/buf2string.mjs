import {pipeN} from '../core/index.mjs';
import hex2decimal from './hex2decimal.mjs';


function charArray2String(charArray) {
    return Array.prototype.map.call(charArray, x => String.fromCharCode(x)).join('');
}

function arrayBuffer2IntArray(buffer) {
    return new Uint8Array(buffer);
}

const buf2string = pipeN(arrayBuffer2IntArray,hex2decimal,charArray2String);

export default buf2string;