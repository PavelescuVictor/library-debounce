import { IDebounceConfig } from './debounce.types';

export const debounce = (callback: Function, debounceConfig: IDebounceConfig): Function => {
    const {
        debounceTime = 1000,
        maxWaitCalls = Infinity,
    } = debounceConfig;

    let timeoutId: number | ReturnType<typeof setTimeout> = -1;
    let currentWaitAmount: number = 0;

    const sanitizeCurrentTimeout = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            currentWaitAmount++;
        }
    }

    const maxWaitReset = (...args: any) => {
        if (currentWaitAmount >= maxWaitCalls) {
            callback(...args);
            currentWaitAmount = 0;
        }
    }

    const handleNewTimeout = (...args: any) => {
        timeoutId = setTimeout(() => {
            callback(...args);
        }, debounceTime)
    }

    return (...args: any) => {
        sanitizeCurrentTimeout();
        maxWaitReset(...args);
        handleNewTimeout(...args);
    };
}

export default debounce;