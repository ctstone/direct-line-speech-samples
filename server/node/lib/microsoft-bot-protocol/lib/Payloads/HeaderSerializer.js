"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TransportConstants_1 = require("../Transport/TransportConstants");
const Header_1 = require("./Models/Header");
const PayloadTypes_1 = require("./Models/PayloadTypes");
class HeaderSerializer {
    static serialize(header, buffer) {
        buffer.write(header.PayloadType, 'utf8');
        buffer.write(this.Delimiter, HeaderSerializer.TypeDelimiterOffset, 'utf8');
        buffer.write(this.headerLengthPadder(header.PayloadLength, this.LengthLength, '0'), HeaderSerializer.LengthOffset, 'utf8');
        buffer.write(this.Delimiter, HeaderSerializer.LengthDelimeterOffset, 'utf8');
        buffer.write(header.Id, HeaderSerializer.IdOffset);
        buffer.write(this.Delimiter, HeaderSerializer.IdDelimeterOffset, 'utf8');
        buffer.write(header.End ? this.End : this.NotEnd, HeaderSerializer.EndOffset);
        buffer.write(this.Terminator, HeaderSerializer.TerminatorOffset);
    }
    static deserialize(buffer) {
        let jsonBuffer = buffer.toString('utf8');
        let headerArray = jsonBuffer.split(this.Delimiter);
        if (headerArray.length < 4) {
            throw Error('Cannot parse header, header is malformed.');
        }
        let headerPayloadType = this.payloadTypeByValue(headerArray[0]);
        let headerPayloadLength = Number(headerArray[1]);
        let headerId = headerArray[2];
        let headerEnd = headerArray[3].startsWith(this.End);
        let header = new Header_1.Header(headerPayloadType, headerPayloadLength, headerId, headerEnd);
        // Note: The constant MaxPayloadLength refers to the chunk size, not the declared length in the header, so
        // we use MaxLength here.
        if (header.PayloadLength < TransportConstants_1.TransportContants.MinLength || header.PayloadLength > TransportConstants_1.TransportContants.MaxLength || header.PayloadLength === undefined) {
            throw Error(`Header payload length must be greater than ${TransportConstants_1.TransportContants.MinLength.toString()} and less than ${TransportConstants_1.TransportContants.MaxLength.toString()}`);
        }
        if (header.Id === undefined) {
            throw Error('Header ID is missing or malformed.');
        }
        if (header.End === undefined) {
            throw Error('Header End is missing or not a valid value.');
        }
        return header;
    }
    static headerLengthPadder(lengthValue, totalLength, padChar) {
        let result = Array(totalLength + 1)
            .join(padChar);
        let lengthString = lengthValue.toString();
        return (result + lengthString).slice(lengthString.length);
    }
    static payloadTypeByValue(value) {
        switch (value) {
            case 'A':
                return PayloadTypes_1.PayloadTypes.request;
                break;
            case 'B':
                return PayloadTypes_1.PayloadTypes.response;
                break;
            case 'S':
                return PayloadTypes_1.PayloadTypes.stream;
                break;
            case 'X':
                return PayloadTypes_1.PayloadTypes.cancelAll;
                break;
            case 'C':
                return PayloadTypes_1.PayloadTypes.cancelStream;
                break;
            default:
                throw Error('Header payload type is malformed.');
        }
    }
}
HeaderSerializer.Delimiter = '.';
HeaderSerializer.Terminator = '\n';
HeaderSerializer.End = '1';
HeaderSerializer.NotEnd = '0';
HeaderSerializer.TypeOffset = 0;
HeaderSerializer.TypeDelimiterOffset = 1;
HeaderSerializer.LengthOffset = 2;
HeaderSerializer.LengthLength = 6;
HeaderSerializer.LengthDelimeterOffset = 8;
HeaderSerializer.IdOffset = 9;
HeaderSerializer.IdLength = 36;
HeaderSerializer.IdDelimeterOffset = 45;
HeaderSerializer.EndOffset = 46;
HeaderSerializer.TerminatorOffset = 47;
exports.HeaderSerializer = HeaderSerializer;
//# sourceMappingURL=HeaderSerializer.js.map