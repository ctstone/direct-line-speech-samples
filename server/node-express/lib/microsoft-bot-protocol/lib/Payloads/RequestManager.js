"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PendingRequest {
}
class RequestManager {
    constructor() {
        this._pendingRequests = {};
    }
    pendingRequestCount() {
        return Object.keys(this._pendingRequests).length;
    }
    async signalResponse(requestId, response) {
        let pendingRequest = this._pendingRequests[requestId];
        if (pendingRequest) {
            pendingRequest.resolve(response);
            /* tslint:disable:no-dynamic-delete */
            delete this._pendingRequests[requestId];
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
    async getResponseAsync(requestId, cancellationToken) {
        let pendingRequest = this._pendingRequests[requestId];
        if (pendingRequest) {
            return Promise.reject('requestId already exists in RequestManager');
        }
        pendingRequest = new PendingRequest();
        pendingRequest.requestId = requestId;
        pendingRequest.cancellationToken = cancellationToken;
        /* tslint:disable:promise-must-complete */
        let promise = new Promise((resolve, reject) => {
            pendingRequest.resolve = resolve;
            pendingRequest.reject = reject;
        });
        this._pendingRequests[requestId] = pendingRequest;
        return promise;
    }
}
exports.RequestManager = RequestManager;
//# sourceMappingURL=RequestManager.js.map