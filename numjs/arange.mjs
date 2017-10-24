import { isNumber } from '../core/index.mjs';

function arange(start, stop, step) {
    /**
     * start
     * stop
     * step
     */
    var getRange = (start, stop, step) => {
        let _start = !isNumber(stop) ? 0 : start,
            _stop = isNumber(stop) ? stop - 1 : start - 1,
            _step = isNumber(step) ? step : 1,
            _N = (_stop - _start) / _step;
        return {
            start: _start,
            stop: _stop,
            step: _step,
            N: Math.floor(_N) + 1
        };
    };
    var buildRange = (arr, start, step) => arr.map(
        x => start + x * step
    );

    if (Array.from && Array.prototype.keys) {
        arange = function arange(start, stop, step) {
            if (!isNumber(start)) {
                return new Error("TypeError: Required argument 'start' (pos 1) not found");
            }

            let range = getRange(start, stop, step);
            let result = buildRange(
                Array.from(Array(range.N).keys()),
                range.start,
                range.step
            );
            return result;
        }
    } else {
        arange = function (start, stop, step) {
            if (!isNumber(start)) {
                return new Error("TypeError: Required argument 'start' (pos 1) not found");
            }
            let range = getRange(start, stop, step);
            let result = buildRange(
                Array.apply(
                    null, { length: range.N }
                ).map((x, y) => y),
                range.start,
                range.step
            );
            return result;
        }
    }
    return arange(start, stop, step);
}

export default arange;