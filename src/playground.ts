import debounce from './debounce';
import {
    IDebounceConfig
} from './debounce.types';
 
const func = (...args: any[]): boolean=> {
    console.log(args);
    console.log("Debounced");
    return true;
}

const config: IDebounceConfig  = {
    // leading: false
    // maxSkippedCalls: 5,
    // maxSkippedTime: 1000,
    batching: true,
}

const debounced = debounce(func, config);
const timeoutId = setInterval(() => {
    debounced(Math.random());
}, 100)

setTimeout(() => {
    clearInterval(timeoutId);
}, 5000)