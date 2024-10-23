import { 
    IDebounceConfig,
} from './debounce.types';

export const debounce = (callback: Function, config: IDebounceConfig = {}): Function => {
    const {
        debounceTime = 1000,
        maxSkippedCalls = Infinity,
        maxSkippedTime = Infinity,
        leading = false,
        trailing = true,
    } = config;

    let _timeoutId: number | ReturnType<typeof setTimeout> = -1;
    let _skippedCallsCounter: number = 0;
    let _startTime: number = -1;
    let _shouldLead: boolean = leading;

    const resetCurrentTimeout = () => {
        if (_timeoutId === -1) {
            return;
        }
        clearTimeout(_timeoutId);
        _skippedCallsCounter++;
        _timeoutId = -1;
    }

    const maxSkippedCallsReset = () => {
        _skippedCallsCounter = 0;
    }

    const maxSkippedCallsCheck = (handleCallback: () => void) => {
        if (maxSkippedCalls === Infinity) {
            return;
        }

        if (_skippedCallsCounter >= maxSkippedCalls) {
            handleCallback();
            maxSkippedCallsReset();
        }
    }

    const maxSkippedtimeReset = (now: number = -1) => {
        _startTime = now;
    }

    const maxSkippedTimeCheck = (handleCallback: () => void) => {
        if (maxSkippedTime === Infinity) {
            return;
        }

        const now = Date.now();
        let elapsedTime = Date.now() - _startTime;
        if (elapsedTime >= maxSkippedTime) {
            handleCallback();
            maxSkippedtimeReset(now);
        }
    }

    const leadingCheck = (leading: boolean, handleCallback: () => void) => {
        if (!leading || !_shouldLead) {
            return;
        }

        handleCallback();
        _shouldLead = false;
    }

    const leadingReset = () => {
        _shouldLead = leading;
    }

    const trailingCheck = (trailing: boolean, handleCallback: () => void) => {
        if (!trailing) {
            return;
        }
        handleCallback();
    }

    const handleNewTimeout = (handleCallback: () => void) => {
        if (_timeoutId) {
            resetCurrentTimeout();
        }
        _timeoutId = setTimeout(() => {
            trailingCheck(trailing, handleCallback);
            maxSkippedCallsReset();
            maxSkippedtimeReset();
            leadingReset();
        }, debounceTime)
    }

    return (...args: any) => {
        const _context = this;
        const handleCallback = () => {
            callback.apply(_context, ...args);
        }
        resetCurrentTimeout();
        maxSkippedCallsCheck(handleCallback);
        maxSkippedTimeCheck(handleCallback);
        leadingCheck(leading, handleCallback);
        handleNewTimeout(handleCallback);
    };
}

export default debounce;