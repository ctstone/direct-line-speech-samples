"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContentStream {
    constructor(id, assembler) {
        if (assembler === undefined) {
            throw Error('Null Argument Exception');
        }
        this.id = id;
        this.assembler = assembler;
    }
    get payloadType() {
        return this.assembler.contentType;
    }
    get length() {
        return this.assembler.contentLength;
    }
    getStream() {
        if (this.stream === undefined) {
            this.stream = this.assembler.getPayloadStream();
        }
        return this.stream;
    }
    cancel() {
        this.assembler.close();
    }
    async readAsString() {
        // do a read-all
        let allData = [];
        let count = 0;
        let stream = this.getStream();
        // populate the array with any existing buffers
        while (count < stream.length) {
            let chunk = stream.read(stream.length);
            allData.push(chunk);
            count += chunk.length;
        }
        if (count < this.length) {
            let readToEnd = new Promise((resolve) => {
                /*stream.on('data', (chunk: any) => {
                  allData.push(chunk);
                  count += (<Buffer>chunk).length;
                  if (count === this.length) {
                    resolve(true);
                  }
                });
        
                stream.on('readable', (chunk: any) => {
                  console.log("Readable has been called!");
                  // allData.push(chunk);
                  // count += (<Buffer>chunk).length;
                  // if (count === this.length) {
                  //   resolve(true);
                  // }
                });*/
                let callback = (cs) => (chunk) => {
                    allData.push(chunk);
                    count += chunk.length;
                    if (count === cs.length) {
                        resolve(true);
                    }
                };
                stream.subscribe(callback(this));
            });
            await readToEnd;
        }
        let s = '';
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < allData.length; i++) {
            s += allData[i].toString('utf8');
        }
        return s;
    }
    async readAsJson() {
        let s = await this.readAsString();
        return JSON.parse(s);
    }
}
exports.ContentStream = ContentStream;
//# sourceMappingURL=ContentStream.js.map