export interface IDebounceConfig {
    debounceTime?: number,
    maxSkippedTime?: number,
    maxSkippedCalls?: number,
    leading?: boolean,
    trailing?: boolean,
    batching?: boolean,
}

export type Callback = (...args: any[]) => any;
export type CallbackReturn<T extends Callback> = ReturnType<T> | undefined;
export type Debounce = <T extends Callback>(callback: T, config?: IDebounceConfig) => (...args: Parameters<T>) => CallbackReturn<T>;
export type HandleCallback<T extends Callback> = () => CallbackReturn<T>;