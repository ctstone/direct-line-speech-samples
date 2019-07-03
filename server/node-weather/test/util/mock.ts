interface Indexable {
  [key: string]: any;
}

export class Mock<T> {
  private respQueueMap = new Map<keyof T, any[]>();

  on<R>(fn: keyof T, resp: R) {
    if (!this.respQueueMap.has(fn)) {
      const indexable = this as any as Indexable;
      this.respQueueMap.set(fn, []);
      indexable[fn.toString()] = () => {
        if (resp instanceof Error) {
          throw resp;
        } else {
          return this.respQueueMap.get(fn).shift();
        }
      };
    }
    this.respQueueMap.get(fn).push(resp);
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
}
