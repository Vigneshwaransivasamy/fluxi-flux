declare module fluxi {
 export function isArray(target: any): boolean;
 export function isPromise(target: any): boolean;
 export function isObject(target: any): boolean;
 export function isString(target: any): boolean;
 export function isDate(target: any): boolean;
 export function isNumber(target: any): boolean;
 export function isNull(target: any): boolean;
 export function isUndefined(target: any): boolean;
 export function isRegex(target: any):boolean;
 export function isBoolean(target: any): boolean;
 export function isFunction(target: any): boolean;
 export function isValid(target: any): boolean;
 export function xNull(target: any): boolean;
 export function xUndefined(target: any): boolean;
 export function isOfType(target: any): boolean;
 export function syncPipe2(fnOne: any, fnTwo: any);
 export function syncPipeN();
 export function pipe2();
 export function pipeN();
 export function delay();
}