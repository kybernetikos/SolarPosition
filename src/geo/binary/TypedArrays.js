var TYPE_SIZES = {
	Byte: 1,
	Int8: 1,
	Uint8: 1,
	Int16: 2,
	Uint16: 2,
	Int32: 4,
	Int: 4,
	Uint32: 4,
	Float32: 4,
	Number: 8,
	Float64: 8
};



function Buffer(bytelen) {
	this.buffer = new ArrayBuffer(bytelen || 100);
	this.view = new DataView(this.buffer);
	this.position = 0;
	this.lastPos = 0;
	this.nextId = 0;
}

Buffer.prototype.resize = function(newBufferSize) {
	newBufferSize = newBufferSize || this.lastPos;
	if (newBufferSize < this.buffer.byteLength) {
		this.buffer = this.buffer.slice(0, newBufferSize);
		this.view = new DataView(this.buffer);
	} else {
		var oldBuffer = this.buffer;
		this.buffer = new ArrayBuffer(newBufferSize);
		// seems like there should be an API for copying one
		// buffer to another.  Blob could do it but it'd be async.
		// Using larger views would probably be more efficient
		// but would require handling edge cases if the size of
		// the array was not a multiple of the byte size.
		var oldView = new Int8Array(oldBuffer);
		var newView = new Int8Array(this.buffer);
		for (var i = 0; i < oldBuffer.length; ++i) {
			newView[i] = oldView[i];
		}
		this.view = new DataView(this.buffer);
	}
};

Buffer.prototype.write = function(type, val) {
	return this.writeArray(type, Array.prototype.slice.call(arguments, 1));
};

Buffer.prototype.writeArray = function(type, values) {
	var newLastPos = Math.max(this.lastPos, this.position + TYPE_SIZES[type] * values.length);
	if (newLastPos > this.buffer.byteLength) {
		this.resize(Math.ceil(newLastPos * 1.5));
	}
	for (var i = 0; i < values.length; ++i) {
		this.view["set"+type](this.position, values[i]);
		this.position = this.position + TYPE_SIZES[type];
	}
	this.lastPos = newLastPos;
	return TYPE_SIZES[type] * values.length;
};

Buffer.prototype.seek = function(byteDif) {
	return this.seekTo(this.position + byteDif);
};

Buffer.prototype.seekTo = function(bytePosition) {
	var oldPosition = this.position;
	bytePosition = bytePosition || 0;
	if (bytePosition < 0) bytePosition = 0;
	this.position = bytePosition;
	if (this.position > this.lastPos) {
		this.lastPos = this.position;
		if (this.lastPos > this.buffer.byteLength) {
			this.resize(Math.ceil(this.lastPos * 1.5));
		}
	}
	return oldPosition;
};

Buffer.prototype.skip = function(type, num) {
	num = num || 1;
	return this.seek(TYPE_SIZES[type] * num);
};

Buffer.prototype.read = function(type) {
	return this.readArray(type, 1)[0];
};

Buffer.prototype.readArray = function(type, number) {
	var newLastPos = Math.max(this.lastPos, this.position + TYPE_SIZES[type] * number);
	if (newLastPos > this.buffer.byteLength) {
		this.resize(Math.ceil(newLastPos * 1.5));
	}
	var result = [];
	for (var i = 0; i < number; ++ i) {
		result[i] = this.view["get"+type](this.position);
		this.position = this.position + TYPE_SIZES[type];
	}
	this.lastPos = newLastPos;
	return result;
};

Buffer.prototype.writeString = function(str) {
	return this.writeArray("Uint8", UTF8.encode(str));
};

Buffer.prototype.readString = function(bytes) {
	return UTF8.decode(this.readArray("Uint8", bytes));
};

Buffer.prototype.writeNumber = function(num) {
	return this.write("Float64", num);
};

Buffer.prototype.readNumber = function() {
	return this.read("Float64");
};

Buffer.prototype.writeInt = function(num) {
	return this.write("Int32", num);
};

Buffer.prototype.readInt = function() {
	return this.read("Int32");
};
/*
var CODE_TYPE = ["Uint8", "Int8", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "String"];
var TYPE_CODE = {
	Byte: 0,
	Int8: 1,
	Uint8: 0,
	Int16: 2,
	Uint16: 3,
	Int32: 4,
	Int: 4,
	Uint32: 5,
	Float32: 6,
	Number: 7,
	Float64: 7,
	String: 8,
	Boolean: 9,
	Array: 10,
	Object: 11
};

Buffer.prototype.serialise = function(input) {
	if (typeof input == 'number') {
		this.write("Uint8", TYPE_CODE["Number"]);
		this.writeNumber(input);
	} else if (typeof input == 'string') {
		this.write("Uint8", TYPE_CODE["String"]);
		var pos = this.skip("Uint16");
		var byteCount = this.writeString(input);
		var end = this.seekTo(pos);
		this.write("Uint16", byteCount);
		this.seekTo(end);
	} else if (typeof input == 'boolean') {
		this.write("Uint8", TYPE_CODE["Boolean"]);
		this.write("Uint8", input ? 1 : 0);
	} else if (typeof input == 'function') {
		throw new Error('Cannot serialise functions.');
	} else if (input instanceof Array) {
		this.write("Uint8", TYPE_CODE["Array"]);
		this.write("Uint32", input.length);
		for (var i = 0; i < input.length; ++i) {
			this.serialise(input[i]);
		}
	} else {
		this.write("Uint8", TYPE_CODE["Object"]);
		var byteSizePos = this.skip("Uint32");
		input.___serialise_id = this.nextId++;
		for (var key in input) {

		}
	}
};
*/
Bits = {
	slice: function(value, start, end) {
		var len = end - start;
		var mask = (1 << len) - 1;
		return (value >> start) & mask;
	}
};

UTF16 = {
	encode: function(string) {
		return Array.prototype.map.call(string, function(s){return s.charCodeAt(0);});
	},
	decode: function(codes) {
		return codes.map(function(n) {return String.fromCharCode(n)}).join("");
	}
};

UTF8 = {
	encode: function(str) {
		var result = [];
		for (var i = 0; i < str.length; ++i) {
			result.push.apply(result, this.toBytes(str.charCodeAt(i)));
		}
		return result;
	},
	decode: function(array) {
		var result = "";
		var copy = array.slice();
		var code = null;
		while ((code = this.fromBytes(copy)) != null) {
			result += String.fromCharCode(code);
		}
		return result;
	},
	toBytes: function(code) {
		if (code <= 0x7f) {
			return [code];
		}
		var result = [];
		while (code > 0) {
			var thisBit = Bits.slice(code, 0, 6);
			code >>= 6;
			if (code > 0) {
				result.unshift(thisBit | 128);
			}
		}
		result.unshift( (0xff << (7-result.length) & 0xff) + thisBit);
		return result;
	},
	fromBytes: function(bytes) {
		if (bytes.length == 0) return null;
		var result = bytes.shift();
		var shifted = 0;
		while ((result & 128) != 0) {
			shifted ++;
			result <<= 1;
		}
		result = (result & 0xff) >> shifted;
		var readAnother = shifted - 1;
		while (readAnother > 0) {
			result = (result << 6)  + (bytes.shift() & 63);
			readAnother --;
		}
		return result;
	}
};
///////////////////////////////////

var x = new Buffer();
x.write("Int8", 10, 14, 15);
x.writeNumber(1.5232);
var len = x.writeString("Hello € world");

x.seekTo(1);
console.log(x.readArray("Int8", 2));
console.log(x.readNumber());
console.log(x.readString(len));

x.seekTo(0);
console.log(x.read("Int8"));

console.log(UTF8.toBytes(8364));
console.log(UTF8.fromBytes([226, 130, 172]));

console.log(UTF8.encode("boo €"));
console.log(UTF8.decode(UTF8.encode("boo €")));

console.log(UTF8.encode("Hello € world"));
console.log(UTF16.encode("Hello € world"));
console.log(UTF16.decode(UTF16.encode("Hello € world")));

