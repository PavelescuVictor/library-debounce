import debounce from './debounce';
import {
    IDebounceConfig
} from './debounce.types';
 
const func = (_b?: number): undefined => {
    console.log("Debounce");
}

const config: IDebounceConfig  = {
    leading: true,
    maxSkippedCalls: 5,
    maxSkippedTime: 1000,
}

const debounced = debounce(func, config);
const timeoutId = setInterval(() => {
    debounced();
}, 100)

setTimeout(() => {
    clearInterval(timeoutId);
}, 5000)