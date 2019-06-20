export declare class CancellationToken {
    private cancelled;
    constructor();
    throwIfCancelled(): void;
    isCancelled(): boolean;
    cancel(): void;
}
export default class CancellationTokenSource {
    readonly token: CancellationToken;
    constructor();
    cancel(): void;
}
