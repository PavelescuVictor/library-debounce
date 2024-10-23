import { 
    Callback,
    CallbackReturn,
    Debounce,
    HandleCallback,
    IDebounceConfig,
} from './debounce.types';

export const debounce: Debounce = <T extends Callback>(callback: T, config: IDebounceConfig = {}) => {
    const {
        debounceTime = 1000,
        maxSkippedCalls = Infinity,
        maxSkippedTime = Infinity,
        leading = false,
        trailing = true,
        batching = false,
        memoization = false,
    } = config;

    let _timeoutId: -1 | ReturnType<typeof setTimeout> = -1;
    let _skippedCallsCounter: number = 0;
    let _startTime: number = -1;
    let _shouldLead: boolean = leading;
    let _accumulatedArgsQueue: Parameters<T>[] = [];
    let _cache = new Map<string, CallbackReturn<T>>();

    const resetCurrentTimeout = (): void=> {
        if (_timeoutId === -1) {
            return;
        }
        
        clearTimeout(_timeoutId);
        _skippedCallsCounter++;
        _timeoutId = -1;
    }

    const maxSkippedCallsReset = (): void => {
        _skippedCallsCounter = 0;
    }

    const maxSkippedCallsCheck = (handleCallback: HandleCallback<T>): CallbackReturn<T> => {
        if (maxSkippedCalls === Infinity) {
            return undefined;
        }

        if (_skippedCallsCounter >= maxSkippedCalls) {
            maxSkippedCallsReset();
            return handleCallback();
        }

        return undefined;
    }

    const maxSkippedtimeReset = () => {
        _startTime = Date.now();
    }

    const maxSkippedTimeCheck = (handleCallback: HandleCallback<T>): CallbackReturn<T> | undefined => {
        if (maxSkippedTime === Infinity) {
            return undefined;
        }

        let elapsedTime = Date.now() - _startTime;
        if (elapsedTime >= maxSkippedTime) {
            maxSkippedtimeReset();
            return handleCallback();
        }

        return undefined;
    }

    const leadingCheck = (leading: boolean, handleCallback: HandleCallback<T>): CallbackReturn<T> | undefined => {
        if (!leading || !_shouldLead) {
            return undefined;
        }

        _shouldLead = false;
        return handleCallback();
    }

    const leadingReset = (): void => {
        _shouldLead = leading;
    }

    const trailingCheck = (trailing: boolean, handleCallback: HandleCallback<T>): CallbackReturn<T> | undefined => {
        if (!trailing) {
            return undefined;
        }

        return handleCallback();
    }

    const handleNewTimeout = (handleCallback: HandleCallback<T>) => {
        if (_timeoutId !== -1) {
            resetCurrentTimeout();
        }

        _timeoutId = setTimeout(() => {
            maxSkippedCallsReset();
            maxSkippedtimeReset();
            leadingReset();
            trailingCheck(trailing, handleCallback);
        }, debounceTime);
    }

    const handleCallback = (args: Parameters<T>): CallbackReturn<T> => {
        maxSkippedCallsReset();
        maxSkippedtimeReset();

        const validBatching = batching && _accumulatedArgsQueue.length > 0;
        let newArgs = validBatching ? _accumulatedArgsQueue : args;
        if (validBatching) {
            _accumulatedArgsQueue = [];
        }

        let cacheKey = '';
        if (memoization) {
            const cacheKey = JSON.stringify(args)
            if (_cache.has(cacheKey)) {
                return _cache.get(cacheKey)
            }
        }

        const _context = this;
        const result = callback.apply(_context, newArgs);
        
        if (memoization) {
            _cache.set(cacheKey, result);
        }

        return result;
    }

    return (...args: Parameters<T>): CallbackReturn<T> | undefined => {
        const _context = this;
        const callbackHandler = handleCallback.bind(_context, args);

        if (batching) {
            _accumulatedArgsQueue.push(args);
        }

        resetCurrentTimeout();

        maxSkippedCallsCheck(callbackHandler);
        maxSkippedTimeCheck(callbackHandler);

        const leadingCheckReturn = leadingCheck(leading, callbackHandler);

        handleNewTimeout(callbackHandler);

        if (leadingCheckReturn) {
            return leadingCheckReturn;
        }

        return undefined;
    };
}

export default debounce;