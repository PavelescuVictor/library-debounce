import { 
    Callback,
    Debounce,
    HandleCallback,
    IDebounceConfig,
} from './debounce.types';

/**
 * Debounce function that handles all the logic of creating the debounced function with all the debouncing logic wrapped and handling the triggering of the user provided callback.
 * @param {T extends Callback} callback The function that the users expects to be triggered.
 * @param {IDebounceConfig} config User customisable config for the debounced function produced.
 * @returns {(...args: Parameters<T>) => CallbackReturn<T>} A debounced function including all the logic for debouncing plus the handler of the callback called when needed based on config settings.
 */
export const debounce: Debounce = <T extends Callback>(callback: T, config: IDebounceConfig = {}): (...args: Parameters<T>) => ReturnType<T> | undefined => {
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
    let _cache = new Map<string, ReturnType<T>>();

    /**
     * Skips the current scheduled callback by clearing the timeout.
     * @returns {void}
     */
    const resetCurrentTimeout = (): void=> {
        if (_timeoutId === -1) {
            return;
        }
        
        clearTimeout(_timeoutId);
        _skippedCallsCounter++;
        _timeoutId = -1;
    }

    /**
     * Resets current amount of skipped calls.
     * @returns {void}
     */
    const maxSkippedCallsReset = (): void => {
        _skippedCallsCounter = 0;
    }

    /**
     * If config value maxSkippedCalls is set, checking for overpassing the allowed amount of skipped calls and callback if needed.
     * @param {HandleCallback<T>} handleCallback The callback that the user provided with the specified args.
     * @returns {ReturnType<T> | undefined} The result of the callback or undefined.
     */
    const maxSkippedCallsCheck = (handleCallback: HandleCallback<T>): ReturnType<T> | undefined => {
        if (maxSkippedCalls === Infinity) {
            return undefined;
        }

        if (_skippedCallsCounter >= maxSkippedCalls) {
            maxSkippedCallsReset();
            return handleCallback();
        }

        return undefined;
    }

    /**
     * Resets current start time for skipped time amount
     * @returns {void}
     */
    const maxSkippedtimeReset = (): void => {
        _startTime = Date.now();
    }

    /**
     * If config value maxSkippedTime is set, checking for overpassing the allowed amount of skipped time and callback if needed.
     * @param {HandleCallback<T>} handleCallback The callback that the user provided with the specified args.
     * @returns {ReturnType<T> | undefined} The result of the callback or undefined.
     */
    const maxSkippedTimeCheck = (handleCallback: HandleCallback<T>): ReturnType<T> | undefined => {
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

    /**
     * If config value leading is set, checking if we should do an immediate call of the callback.
     * @param {HandleCallback<T>} handleCallback The callback that the user provided with the specified args.
     * @returns {ReturnType<T> | undefined} The result of the callback or undefined.
     */
    const leadingCheck = (handleCallback: HandleCallback<T>): ReturnType<T> | undefined => {
        if (!leading || !_shouldLead) {
            return undefined;
        }

        _shouldLead = false;
        return handleCallback();
    }

    /**
     * Resets leading back to the original configured value from the user.
     * @returns {void}
     */
    const leadingReset = (): void => {
        _shouldLead = leading;
    }

    /**
     * If config value trailing is set, checking if we should do an call of the callback after the debounced time has passed.
     * @param {HandleCallback<T>} handleCallback The callback that the user provided with the specified args.
     * @returns {ReturnType<T> | undefined} The result of the callback or undefined.
     */
    const trailingCheck = (handleCallback: HandleCallback<T>): ReturnType<T> | undefined => {
        if (!trailing) {
            return undefined;
        }

        return handleCallback();
    }

    /**
     * Creating new timeout while resetting the necessary values to the original states and clearing previous timeout.
     * @param {HandleCallback<T>} handleCallback The callback that the user provided with the specified args.
     * @returns {void}
     */
    const handleNewTimeout = (handleCallback: HandleCallback<T>): void => {
        if (_timeoutId !== -1) {
            resetCurrentTimeout();
        }

        _timeoutId = setTimeout(() => {
            maxSkippedCallsReset();
            maxSkippedtimeReset();
            leadingReset();
            trailingCheck(handleCallback);
        }, debounceTime);
    }
    
    /**
     * Handles the callback call while resetting the necessary values to the original states. 
     * The function also checks for batching and memoization if enabled by the user through the config.
     * @param {Parameters<T>} args The arguments that are passed by the user to the callback.
     * @returns {ReturnType<T> | undefined} The result of the callback or undefined.
     */
    const handleCallback = (args: Parameters<T>): ReturnType<T> | undefined => {
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

    /**
     * The debounced function that handles all debouncing logic.
     * @param {Parameters<T>} args The arguments that are passed by the user to the callback.
     * @returns {ReturnType<T> | undefined} The result of the callback or undefined.
     */
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
        const _context = this;
        const callbackHandler = handleCallback.bind(_context, args);

        if (batching) {
            _accumulatedArgsQueue.push(args);
        }

        resetCurrentTimeout();

        maxSkippedCallsCheck(callbackHandler);
        maxSkippedTimeCheck(callbackHandler);

        const leadingCheckReturn = leadingCheck(callbackHandler);

        handleNewTimeout(callbackHandler);

        if (leadingCheckReturn) {
            return leadingCheckReturn;
        }

        return undefined;
    };
}

export default debounce;