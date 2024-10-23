import debounce from './debounce';

const func = () => {
    "Debounced"
}
const debounced = debounce(func)
const timeoutId = setInterval(() => {
    debounced();
}, 100)

setTimeout(() => {
    clearInterval(timeoutId);
}, 10000)