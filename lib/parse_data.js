var StringDecoder = require('string_decoder').StringDecoder;

exports.parseData = function (cb) {
    var self = this;

    var decoder = new StringDecoder('utf8');
    var strbuf = '';

    self.stream.on('data', function ondata (buf, offset) {
        if (offset === undefined) offset = 0;

        if (self.bytes) {
            var ix = Math.min(buf.length, offset + self.bytes);
            var chunk = buf.slice(offset, ix);
            self.target.write(chunk);
            
            self.bytes -= chunk.length;
            if (self.bytes === 0) {
                if (buf.length > offset + chunk.length) {
                    ondata(buf, offset + chunk.length);
                }
                self.target.end();
            }
        }
        else {
            strbuf += decoder.write(buf);
            cbLines(false);
        }
    });

    self.stream.on('end', function onend () {
        strbuf += decoder.end();
        cbLines(true);
    });

    function cbLines(end) {
        var lines = strbuf.split(/\r\n/g),
            lineslen = lines.length;
        for (var i = 0; i < lineslen; i++) {
            if (i < lineslen - 1 || end) {
                cb(lines[i]);
            } else {
                strbuf = lines[i];
            }
        }
    }
}

exports.getBytes = function (n, target) {
    this.bytes = n;
    this.target = target;
};
