interface Indexable {
  [key: string]: any;
}

export const MOCK_SELF = {};

export class Mock<T> {
  private respQueues = new Map<keyof T, any[]>();
  private argsHistories = new Map<keyof T, any[][]>();

  on<R>(fn: keyof T, resp: R) {
    const { respQueues, argsHistories } = this;
    let respQueue: R[];
    if (respQueues.has(fn)) {
      respQueue = respQueues.get(fn);
    } else {
      const argsHistory: any[] = [];
      const indexable = this as any as Indexable;
      respQueue = [];
      respQueues.set(fn, respQueue);
      argsHistories.set(fn, argsHistory);
      indexable[fn.toString()] = (...args: any[]) => {
        argsHistory.push(args);
        if (resp instanceof Error) {
          throw resp;
        } else if (resp === MOCK_SELF) {
          return this;
        } else {
          return respQueue.shift();
        }
      };
    }
    respQueue.push(resp);
    return this;
  }

  onPromised<K extends keyof T, R>(fn: K, resp: R) {
    const promise = new Promise((resolve, reject) => {
      if (resp instanceof Error) {
        reject(resp);
      } else {
        resolve(resp);
      }
    });
    return this.on(fn, promise);
  }

  withProperty<P>(key: keyof T, value: P) {
    (this as any as Indexable)[key.toString()] = value;
  }

  mock(): T {
    return this as any as T;
  }

  argsPassed<K extends keyof T>(fn: K) {
    return this.argsHistories.get(fn);
  }
}
