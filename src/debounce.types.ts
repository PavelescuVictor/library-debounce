export interface IDebounceConfig {
    debounceTime?: number,
    maxSkippedTime?: number,
    maxSkippedCalls?: number,
    leading?: boolean,
    trailing?: boolean,
    batching?: boolean,
    memoization?: boolean,
}

export type Callback = (...args: any[]) => any;
export type Debounce = <T extends Callback>(callback: T, config?: IDebounceConfig) => (...args: Parameters<T>) => ReturnType<T> | undefined;
export type HandleCallback<T extends Callback> = () => ReturnType<T> | undefined;