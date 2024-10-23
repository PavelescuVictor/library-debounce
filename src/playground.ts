import debounce from './debounce';

const func = (_b?: number): undefined => {
    console.log("Debounce");
}

const debounced = debounce(func)
const timeoutId = setInterval(() => {
    debounced();
}, 100)

setTimeout(() => {
    clearInterval(timeoutId);
}, 10000)