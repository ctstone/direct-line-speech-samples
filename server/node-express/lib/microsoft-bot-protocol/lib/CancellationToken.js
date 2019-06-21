"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CancellationToken {
    constructor() {
        this.cancelled = false;
    }
    throwIfCancelled() {
        if (this.isCancelled()) {
            throw new Error('cancelled');
        }
    }
    isCancelled() {
        return this.cancelled === true;
    }
    cancel() {
        this.cancelled = true;
    }
}
exports.CancellationToken = CancellationToken;
class CancellationTokenSource {
    constructor() {
        this.token = new CancellationToken();
    }
    cancel() {
        this.token.cancel();
    }
}
exports.default = CancellationTokenSource;
//# sourceMappingURL=CancellationToken.js.map