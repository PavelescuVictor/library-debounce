import debounce from './debounce';
import {
    IDebounceConfig
} from './debounce.types';
 
const isEqual = (a: number, b: number): boolean=> {
    return a === b;
}

const config: IDebounceConfig  = {
    // leading: true,
    maxSkippedCalls: 5,
    maxSkippedTime: 1000,
    // batching: true,
}

const debounced = debounce(isEqual, config);
const timeoutId = setInterval(() => {
    debounced(Math.floor(Math.random() * 10 / 3), Math.floor(Math.random() * 10 / 3));
}, 100)

setTimeout(() => {
    clearInterval(timeoutId);
}, 5000)