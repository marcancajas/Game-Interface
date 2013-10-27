// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  Module['print'] = function(x) {
    console.log(x);
  };
  Module['printErr'] = function(x) {
    console.log(x);
  };
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
    dump(x);
  }) : (function(x) {
    // self.postMessage(x); // enable this if you want stdout to be sent as messages
  }));
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 1536;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } },{ func: function() { __GLOBAL__I_a6() } });
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTIt;
var __ZTIs;
var __ZTIm;
var __ZTIl;
var __ZTIj;
var __ZTIi;
var __ZTIh;
var __ZTIf;
var __ZTId;
var __ZTIc;
var __ZTIa;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,232,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,248,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIt=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIs=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIm=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIl=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIj=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIi=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIh=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIf=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTId=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIc=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIa=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([26,0,0,0,0,0,0,0,108,111,110,103,0,0,0,0,117,110,115,105,103,110,101,100,32,105,110,116,0,0,0,0,105,110,116,0,0,0,0,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,0,115,104,111,114,116,0,0,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,0,0,115,105,103,110,101,100,32,99,104,97,114,0,0,0,0,0,99,104,97,114,0,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,115,116,100,58,58,119,115,116,114,105,110,103,0,0,0,0,115,116,100,58,58,115,116,114,105,110,103,0,0,0,0,0,100,111,117,98,108,101,0,0,98,111,111,108,0,0,0,0,102,108,111,97,116,0,0,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,0,0,118,111,105,100,0,0,0,0,108,101,114,112,0,0,0,0,0,0,0,0,200,3,0,0,30,0,0,0,6,0,0,0,22,0,0,0,2,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,3,0,0,30,0,0,0,4,0,0,0,22,0,0,0,2,0,0,0,38,0,0,0,34,0,0,0,20,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,0,0,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,248,0,0,0,72,1,0,0,248,0,0,0,160,1,0,0,0,0,0,0,176,1,0,0,0,0,0,0,192,1,0,0,32,1,0,0,232,1,0,0,0,0,0,0,1,0,0,0,128,3,0,0,0,0,0,0,32,1,0,0,40,2,0,0,0,0,0,0,1,0,0,0,128,3,0,0,0,0,0,0,0,0,0,0,104,2,0,0,0,0,0,0,128,2,0,0,0,0,0,0,160,2,0,0,8,4,0,0,0,0,0,0,0,0,0,0,200,2,0,0,248,3,0,0,0,0,0,0,0,0,0,0,240,2,0,0,248,3,0,0,0,0,0,0,0,0,0,0,24,3,0,0,8,4,0,0,0,0,0,0,0,0,0,0,64,3,0,0,120,3,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(30);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(24);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(22);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(38);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(14);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(12);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(30);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(36);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(22);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(38);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(40);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(28);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(16);
HEAP32[((__ZTIt)>>2)]=(((248)|0));
HEAP32[(((__ZTIt)+(4))>>2)]=((336)|0);
HEAP32[((__ZTIs)>>2)]=(((248)|0));
HEAP32[(((__ZTIs)+(4))>>2)]=((344)|0);
HEAP32[((__ZTIm)>>2)]=(((248)|0));
HEAP32[(((__ZTIm)+(4))>>2)]=((352)|0);
HEAP32[((__ZTIl)>>2)]=(((248)|0));
HEAP32[(((__ZTIl)+(4))>>2)]=((360)|0);
HEAP32[((__ZTIj)>>2)]=(((248)|0));
HEAP32[(((__ZTIj)+(4))>>2)]=((368)|0);
HEAP32[((__ZTIi)>>2)]=(((248)|0));
HEAP32[(((__ZTIi)+(4))>>2)]=((376)|0);
HEAP32[((__ZTIh)>>2)]=(((248)|0));
HEAP32[(((__ZTIh)+(4))>>2)]=((384)|0);
HEAP32[((__ZTIf)>>2)]=(((248)|0));
HEAP32[(((__ZTIf)+(4))>>2)]=((392)|0);
HEAP32[((__ZTId)>>2)]=(((248)|0));
HEAP32[(((__ZTId)+(4))>>2)]=((400)|0);
HEAP32[((__ZTIc)>>2)]=(((248)|0));
HEAP32[(((__ZTIc)+(4))>>2)]=((408)|0);
HEAP32[((__ZTIa)>>2)]=(((248)|0));
HEAP32[(((__ZTIa)+(4))>>2)]=((424)|0);
HEAP32[((888)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((896)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((952)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((960)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((968)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((984)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1000)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1016)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1032)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
;
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
;
;
;
;
;
;
;
;
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,0,__ZN10__cxxabiv123__fundamental_type_infoD0Ev,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi
,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__Z4lerpfff,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib
,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,___getTypeName,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN10__cxxabiv116__shim_type_infoD2Ev
,0,__ZN10emscripten8internal7InvokerIfJfffEE6invokeEPFffffEfff,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv];
// EMSCRIPTEN_START_FUNCS
function __ZN10__cxxabiv116__shim_type_infoD2Ev($this) {
 var label = 0;
 return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this) {
 var label = 0;
 return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this) {
 var label = 0;
 return;
}
function __Z4lerpfff($a, $b, $t) {
 var label = 0;
 var $1=(1)-($t);
 var $2=($1)*($a);
 var $3=($t)*($b);
 var $4=($2)+($3);
 return $4;
}
function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $0) {
 var label = 0;
 var $2=(($this)|0);
 var $3=(($thrown_type)|0);
 var $4=(($2)|(0))==(($3)|(0));
 return $4;
}
function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($info+8)|0);
   var $2=HEAP32[(($1)>>2)];
   var $3=(($2)|(0))==(($this)|(0));
   if ($3) { label = 2; break; } else { label = 8; break; }
  case 2: 
   var $5=(($info+16)|0);
   var $6=HEAP32[(($5)>>2)];
   var $7=(($6)|(0))==0;
   if ($7) { label = 3; break; } else { label = 4; break; }
  case 3: 
   HEAP32[(($5)>>2)]=$adjustedPtr;
   var $9=(($info+24)|0);
   HEAP32[(($9)>>2)]=$path_below;
   var $10=(($info+36)|0);
   HEAP32[(($10)>>2)]=1;
   label = 8; break;
  case 4: 
   var $12=(($6)|(0))==(($adjustedPtr)|(0));
   if ($12) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $14=(($info+24)|0);
   var $15=HEAP32[(($14)>>2)];
   var $16=(($15)|(0))==2;
   if ($16) { label = 6; break; } else { label = 8; break; }
  case 6: 
   HEAP32[(($14)>>2)]=$path_below;
   label = 8; break;
  case 7: 
   var $19=(($info+36)|0);
   var $20=HEAP32[(($19)>>2)];
   var $21=((($20)+(1))|0);
   HEAP32[(($19)>>2)]=$21;
   var $22=(($info+24)|0);
   HEAP32[(($22)>>2)]=2;
   var $23=(($info+54)|0);
   HEAP8[($23)]=1;
   label = 8; break;
  case 8: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal7InvokerIfJfffEE6invokeEPFffffEfff($fn, $args, $args1, $args2) {
 var label = 0;
 var $1=FUNCTION_TABLE[$fn]($args, $args1, $args2);
 return $1;
}
function __GLOBAL__I_a() {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $args_i_i_i=sp;
 var $1=$args_i_i_i;
 var $2=(($args_i_i_i)|0);
 HEAP32[(($2)>>2)]=4;
 var $3=(($args_i_i_i+4)|0);
 HEAP32[(($3)>>2)]=__ZTIf;
 var $4=(($args_i_i_i+8)|0);
 HEAP32[(($4)>>2)]=__ZTIf;
 var $5=(($args_i_i_i+12)|0);
 HEAP32[(($5)>>2)]=__ZTIf;
 var $6=(($args_i_i_i+16)|0);
 HEAP32[(($6)>>2)]=__ZTIf;
 __embind_register_function(((232)|0), 4, $3, (32), (18));
 STACKTOP = sp;
 return;
}
function ___getTypeName($ti) {
 var label = 0;
 var $1=(($ti+4)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=_strdup($2);
 return $3;
}
function __GLOBAL__I_a6() {
 var label = 0;
 __embind_register_void(872, ((224)|0));
 __embind_register_bool(880, ((192)|0), 1, 0);
 __embind_register_integer(__ZTIc, ((104)|0), -128, 127);
 __embind_register_integer(__ZTIa, ((88)|0), -128, 127);
 __embind_register_integer(__ZTIh, ((72)|0), 0, 255);
 __embind_register_integer(__ZTIs, ((64)|0), -32768, 32767);
 __embind_register_integer(__ZTIt, ((48)|0), 0, 65535);
 __embind_register_integer(__ZTIi, ((40)|0), -2147483648, 2147483647);
 __embind_register_integer(__ZTIj, ((24)|0), 0, -1);
 __embind_register_integer(__ZTIl, ((16)|0), -2147483648, 2147483647);
 __embind_register_integer(__ZTIm, ((208)|0), 0, -1);
 __embind_register_float(__ZTIf, ((200)|0));
 __embind_register_float(__ZTId, ((184)|0));
 __embind_register_std_string(928, ((168)|0));
 __embind_register_std_wstring(904, 4, ((152)|0));
 __embind_register_emval(952, ((136)|0));
 __embind_register_memory_view(960, ((112)|0));
 return;
}
function __ZN10__cxxabiv123__fundamental_type_infoD0Ev($this) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|(0))==0;
   if ($1) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $3=$this;
   _free($3);
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv117__class_type_infoD0Ev($this) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|(0))==0;
   if ($1) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $3=$this;
   _free($3);
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|(0))==0;
   if ($1) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $3=$this;
   _free($3);
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($this) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|(0))==0;
   if ($1) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $3=$this;
   _free($3);
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $adjustedPtr) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 112)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $info_i=sp;
   var $info=(sp)+(56);
   var $1=(($this)|0);
   var $2=(($thrown_type)|0);
   var $3=(($1)|(0))==(($2)|(0));
   if ($3) { var $_0 = 1;label = 17; break; } else { label = 2; break; }
  case 2: 
   var $5=(($thrown_type)|(0))==0;
   if ($5) { var $_0 = 0;label = 17; break; } else { label = 3; break; }
  case 3: 
   var $7=$thrown_type;
   var $8=$info_i;
   var $9=$thrown_type;
   var $10=HEAP32[(($9)>>2)];
   var $11=((($10)-(8))|0);
   var $12=HEAP32[(($11)>>2)];
   var $13=$12;
   var $14=(($7+$13)|0);
   var $15=((($10)-(4))|0);
   var $16=HEAP32[(($15)>>2)];
   var $17=$16;
   var $18=(($info_i)|0);
   HEAP32[(($18)>>2)]=1016;
   var $19=(($info_i+4)|0);
   HEAP32[(($19)>>2)]=$7;
   var $20=(($info_i+8)|0);
   HEAP32[(($20)>>2)]=1032;
   var $21=(($info_i+12)|0);
   HEAP32[(($21)>>2)]=-1;
   var $22=(($info_i+16)|0);
   var $23=(($info_i+20)|0);
   var $24=(($info_i+24)|0);
   var $25=(($info_i+28)|0);
   var $26=(($info_i+32)|0);
   var $27=(($info_i+40)|0);
   var $28=(($16)|(0))==1016;
   var $29=$22;
   _memset($29, 0, 39);
   if ($28) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $31=(($info_i+48)|0);
   HEAP32[(($31)>>2)]=1;
   var $32=HEAP32[((1016)>>2)];
   var $33=(($32+20)|0);
   var $34=HEAP32[(($33)>>2)];
   FUNCTION_TABLE[$34]($17, $info_i, $14, $14, 1, 0);
   var $35=HEAP32[(($24)>>2)];
   var $36=(($35)|(0))==1;
   var $__i=$36 ? $14 : 0;
   var $68 = $__i;label = 14; break;
  case 5: 
   var $38=(($info_i+36)|0);
   var $39=$16;
   var $40=HEAP32[(($39)>>2)];
   var $41=(($40+24)|0);
   var $42=HEAP32[(($41)>>2)];
   FUNCTION_TABLE[$42]($17, $info_i, $14, 1, 0);
   var $43=HEAP32[(($38)>>2)];
   if ((($43)|(0))==0) {
    label = 6; break;
   }
   else if ((($43)|(0))==1) {
    label = 9; break;
   }
   else {
   var $68 = 0;label = 14; break;
   }
  case 6: 
   var $45=HEAP32[(($27)>>2)];
   var $46=(($45)|(0))==1;
   if ($46) { label = 7; break; } else { var $68 = 0;label = 14; break; }
  case 7: 
   var $48=HEAP32[(($25)>>2)];
   var $49=(($48)|(0))==1;
   if ($49) { label = 8; break; } else { var $68 = 0;label = 14; break; }
  case 8: 
   var $51=HEAP32[(($26)>>2)];
   var $52=(($51)|(0))==1;
   var $53=HEAP32[(($23)>>2)];
   var $_13_i=$52 ? $53 : 0;
   var $68 = $_13_i;label = 14; break;
  case 9: 
   var $55=HEAP32[(($24)>>2)];
   var $56=(($55)|(0))==1;
   if ($56) { label = 13; break; } else { label = 10; break; }
  case 10: 
   var $58=HEAP32[(($27)>>2)];
   var $59=(($58)|(0))==0;
   if ($59) { label = 11; break; } else { var $68 = 0;label = 14; break; }
  case 11: 
   var $61=HEAP32[(($25)>>2)];
   var $62=(($61)|(0))==1;
   if ($62) { label = 12; break; } else { var $68 = 0;label = 14; break; }
  case 12: 
   var $64=HEAP32[(($26)>>2)];
   var $65=(($64)|(0))==1;
   if ($65) { label = 13; break; } else { var $68 = 0;label = 14; break; }
  case 13: 
   var $67=HEAP32[(($22)>>2)];
   var $68 = $67;label = 14; break;
  case 14: 
   var $68;
   var $69=$68;
   var $70=(($68)|(0))==0;
   if ($70) { var $_0 = 0;label = 17; break; } else { label = 15; break; }
  case 15: 
   var $72=$info;
   _memset($72, 0, 56);
   var $73=(($info)|0);
   HEAP32[(($73)>>2)]=$69;
   var $74=(($info+8)|0);
   HEAP32[(($74)>>2)]=$this;
   var $75=(($info+12)|0);
   HEAP32[(($75)>>2)]=-1;
   var $76=(($info+48)|0);
   HEAP32[(($76)>>2)]=1;
   var $77=$68;
   var $78=HEAP32[(($77)>>2)];
   var $79=(($78+28)|0);
   var $80=HEAP32[(($79)>>2)];
   var $81=HEAP32[(($adjustedPtr)>>2)];
   FUNCTION_TABLE[$80]($69, $info, $81, 1);
   var $82=(($info+24)|0);
   var $83=HEAP32[(($82)>>2)];
   var $84=(($83)|(0))==1;
   if ($84) { label = 16; break; } else { var $_0 = 0;label = 17; break; }
  case 16: 
   var $86=(($info+16)|0);
   var $87=HEAP32[(($86)>>2)];
   HEAP32[(($adjustedPtr)>>2)]=$87;
   var $_0 = 1;label = 17; break;
  case 17: 
   var $_0;
   STACKTOP = sp;
   return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|0);
   var $2=(($info+8)|0);
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|0);
   var $5=(($1)|(0))==(($4)|(0));
   if ($5) { label = 2; break; } else { label = 8; break; }
  case 2: 
   var $7=(($info+16)|0);
   var $8=HEAP32[(($7)>>2)];
   var $9=(($8)|(0))==0;
   if ($9) { label = 3; break; } else { label = 4; break; }
  case 3: 
   HEAP32[(($7)>>2)]=$adjustedPtr;
   var $11=(($info+24)|0);
   HEAP32[(($11)>>2)]=$path_below;
   var $12=(($info+36)|0);
   HEAP32[(($12)>>2)]=1;
   label = 9; break;
  case 4: 
   var $14=(($8)|(0))==(($adjustedPtr)|(0));
   if ($14) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $16=(($info+24)|0);
   var $17=HEAP32[(($16)>>2)];
   var $18=(($17)|(0))==2;
   if ($18) { label = 6; break; } else { label = 9; break; }
  case 6: 
   HEAP32[(($16)>>2)]=$path_below;
   label = 9; break;
  case 7: 
   var $21=(($info+36)|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=((($22)+(1))|0);
   HEAP32[(($21)>>2)]=$23;
   var $24=(($info+24)|0);
   HEAP32[(($24)>>2)]=2;
   var $25=(($info+54)|0);
   HEAP8[($25)]=1;
   label = 9; break;
  case 8: 
   var $27=(($this+8)|0);
   var $28=HEAP32[(($27)>>2)];
   var $29=$28;
   var $30=HEAP32[(($29)>>2)];
   var $31=(($30+28)|0);
   var $32=HEAP32[(($31)>>2)];
   FUNCTION_TABLE[$32]($28, $info, $adjustedPtr, $path_below);
   label = 9; break;
  case 9: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|0);
   var $2=(($info+8)|0);
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|0);
   var $5=(($1)|(0))==(($4)|(0));
   if ($5) { label = 2; break; } else { label = 8; break; }
  case 2: 
   var $7=(($info+16)|0);
   var $8=HEAP32[(($7)>>2)];
   var $9=(($8)|(0))==0;
   if ($9) { label = 3; break; } else { label = 4; break; }
  case 3: 
   HEAP32[(($7)>>2)]=$adjustedPtr;
   var $11=(($info+24)|0);
   HEAP32[(($11)>>2)]=$path_below;
   var $12=(($info+36)|0);
   HEAP32[(($12)>>2)]=1;
   label = 16; break;
  case 4: 
   var $14=(($8)|(0))==(($adjustedPtr)|(0));
   if ($14) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $16=(($info+24)|0);
   var $17=HEAP32[(($16)>>2)];
   var $18=(($17)|(0))==2;
   if ($18) { label = 6; break; } else { label = 16; break; }
  case 6: 
   HEAP32[(($16)>>2)]=$path_below;
   label = 16; break;
  case 7: 
   var $21=(($info+36)|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=((($22)+(1))|0);
   HEAP32[(($21)>>2)]=$23;
   var $24=(($info+24)|0);
   HEAP32[(($24)>>2)]=2;
   var $25=(($info+54)|0);
   HEAP8[($25)]=1;
   label = 16; break;
  case 8: 
   var $27=(($this+12)|0);
   var $28=HEAP32[(($27)>>2)];
   var $29=(($this+16+($28<<3))|0);
   var $30=(($this+20)|0);
   var $31=HEAP32[(($30)>>2)];
   var $32=$31 >> 8;
   var $33=$31 & 1;
   var $34=(($33)|(0))==0;
   if ($34) { var $offset_to_base_0_i16 = $32;label = 10; break; } else { label = 9; break; }
  case 9: 
   var $36=$adjustedPtr;
   var $37=HEAP32[(($36)>>2)];
   var $38=(($37+$32)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $offset_to_base_0_i16 = $40;label = 10; break;
  case 10: 
   var $offset_to_base_0_i16;
   var $41=(($this+16)|0);
   var $42=HEAP32[(($41)>>2)];
   var $43=$42;
   var $44=HEAP32[(($43)>>2)];
   var $45=(($44+28)|0);
   var $46=HEAP32[(($45)>>2)];
   var $47=(($adjustedPtr+$offset_to_base_0_i16)|0);
   var $48=$31 & 2;
   var $49=(($48)|(0))!=0;
   var $50=$49 ? $path_below : 2;
   FUNCTION_TABLE[$46]($42, $info, $47, $50);
   var $51=(($28)|(0)) > 1;
   if ($51) { label = 11; break; } else { label = 16; break; }
  case 11: 
   var $52=(($this+24)|0);
   var $53=(($info+54)|0);
   var $54=$adjustedPtr;
   var $p_0 = $52;label = 12; break;
  case 12: 
   var $p_0;
   var $56=(($p_0+4)|0);
   var $57=HEAP32[(($56)>>2)];
   var $58=$57 >> 8;
   var $59=$57 & 1;
   var $60=(($59)|(0))==0;
   if ($60) { var $offset_to_base_0_i = $58;label = 14; break; } else { label = 13; break; }
  case 13: 
   var $62=HEAP32[(($54)>>2)];
   var $63=(($62+$58)|0);
   var $64=$63;
   var $65=HEAP32[(($64)>>2)];
   var $offset_to_base_0_i = $65;label = 14; break;
  case 14: 
   var $offset_to_base_0_i;
   var $66=(($p_0)|0);
   var $67=HEAP32[(($66)>>2)];
   var $68=$67;
   var $69=HEAP32[(($68)>>2)];
   var $70=(($69+28)|0);
   var $71=HEAP32[(($70)>>2)];
   var $72=(($adjustedPtr+$offset_to_base_0_i)|0);
   var $73=$57 & 2;
   var $74=(($73)|(0))!=0;
   var $75=$74 ? $path_below : 2;
   FUNCTION_TABLE[$71]($67, $info, $72, $75);
   var $76=HEAP8[($53)];
   var $77=$76 & 1;
   var $78=(($77 << 24) >> 24)==0;
   if ($78) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $80=(($p_0+8)|0);
   var $81=(($80)>>>(0)) < (($29)>>>(0));
   if ($81) { var $p_0 = $80;label = 12; break; } else { label = 16; break; }
  case 16: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|0);
   var $2=(($info+8)|0);
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|0);
   var $5=(($1)|(0))==(($4)|(0));
   if ($5) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $7=(($info+4)|0);
   var $8=HEAP32[(($7)>>2)];
   var $9=(($8)|(0))==(($current_ptr)|(0));
   if ($9) { label = 3; break; } else { label = 53; break; }
  case 3: 
   var $11=(($info+28)|0);
   var $12=HEAP32[(($11)>>2)];
   var $13=(($12)|(0))==1;
   if ($13) { label = 53; break; } else { label = 4; break; }
  case 4: 
   HEAP32[(($11)>>2)]=$path_below;
   label = 53; break;
  case 5: 
   var $16=(($info)|0);
   var $17=HEAP32[(($16)>>2)];
   var $18=(($17)|0);
   var $19=(($1)|(0))==(($18)|(0));
   if ($19) { label = 6; break; } else { label = 29; break; }
  case 6: 
   var $21=(($info+16)|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22)|(0))==(($current_ptr)|(0));
   if ($23) { label = 8; break; } else { label = 7; break; }
  case 7: 
   var $25=(($info+20)|0);
   var $26=HEAP32[(($25)>>2)];
   var $27=(($26)|(0))==(($current_ptr)|(0));
   if ($27) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $29=(($path_below)|(0))==1;
   if ($29) { label = 9; break; } else { label = 53; break; }
  case 9: 
   var $31=(($info+32)|0);
   HEAP32[(($31)>>2)]=1;
   label = 53; break;
  case 10: 
   var $33=(($info+32)|0);
   HEAP32[(($33)>>2)]=$path_below;
   var $34=(($info+44)|0);
   var $35=HEAP32[(($34)>>2)];
   var $36=(($35)|(0))==4;
   if ($36) { label = 53; break; } else { label = 11; break; }
  case 11: 
   var $38=(($this+12)|0);
   var $39=HEAP32[(($38)>>2)];
   var $40=(($this+16+($39<<3))|0);
   var $41=(($39)|(0)) > 0;
   if ($41) { label = 12; break; } else { var $is_dst_type_derived_from_static_type_2_off098 = 0;label = 23; break; }
  case 12: 
   var $42=(($this+16)|0);
   var $43=(($info+52)|0);
   var $44=(($info+53)|0);
   var $45=(($info+54)|0);
   var $46=(($this+8)|0);
   var $47=(($info+24)|0);
   var $48=$current_ptr;
   var $does_dst_type_point_to_our_static_type_0_off087 = 0;var $p_088 = $42;var $is_dst_type_derived_from_static_type_0_off089 = 0;label = 13; break;
  case 13: 
   var $is_dst_type_derived_from_static_type_0_off089;
   var $p_088;
   var $does_dst_type_point_to_our_static_type_0_off087;
   HEAP8[($43)]=0;
   HEAP8[($44)]=0;
   var $50=(($p_088+4)|0);
   var $51=HEAP32[(($50)>>2)];
   var $52=$51 >> 8;
   var $53=$51 & 1;
   var $54=(($53)|(0))==0;
   if ($54) { var $offset_to_base_0_i81 = $52;label = 15; break; } else { label = 14; break; }
  case 14: 
   var $56=HEAP32[(($48)>>2)];
   var $57=(($56+$52)|0);
   var $58=$57;
   var $59=HEAP32[(($58)>>2)];
   var $offset_to_base_0_i81 = $59;label = 15; break;
  case 15: 
   var $offset_to_base_0_i81;
   var $60=(($p_088)|0);
   var $61=HEAP32[(($60)>>2)];
   var $62=$61;
   var $63=HEAP32[(($62)>>2)];
   var $64=(($63+20)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($current_ptr+$offset_to_base_0_i81)|0);
   var $67=$51 >>> 1;
   var $68=$67 & 1;
   var $69=(((2)-($68))|0);
   FUNCTION_TABLE[$65]($61, $info, $current_ptr, $66, $69, $use_strcmp);
   var $70=HEAP8[($45)];
   var $71=$70 & 1;
   var $72=(($71 << 24) >> 24)==0;
   if ($72) { label = 16; break; } else { var $is_dst_type_derived_from_static_type_2_off0 = $is_dst_type_derived_from_static_type_0_off089;var $does_dst_type_point_to_our_static_type_0_off0_lcssa = $does_dst_type_point_to_our_static_type_0_off087;label = 22; break; }
  case 16: 
   var $74=HEAP8[($44)];
   var $75=$74 & 1;
   var $76=(($75 << 24) >> 24)==0;
   if ($76) { var $is_dst_type_derived_from_static_type_1_off0 = $is_dst_type_derived_from_static_type_0_off089;var $does_dst_type_point_to_our_static_type_1_off0 = $does_dst_type_point_to_our_static_type_0_off087;label = 21; break; } else { label = 17; break; }
  case 17: 
   var $78=HEAP8[($43)];
   var $79=$78 & 1;
   var $80=(($79 << 24) >> 24)==0;
   if ($80) { label = 20; break; } else { label = 18; break; }
  case 18: 
   var $82=HEAP32[(($47)>>2)];
   var $83=(($82)|(0))==1;
   if ($83) { label = 27; break; } else { label = 19; break; }
  case 19: 
   var $85=HEAP32[(($46)>>2)];
   var $86=$85 & 2;
   var $87=(($86)|(0))==0;
   if ($87) { label = 27; break; } else { var $is_dst_type_derived_from_static_type_1_off0 = 1;var $does_dst_type_point_to_our_static_type_1_off0 = 1;label = 21; break; }
  case 20: 
   var $89=HEAP32[(($46)>>2)];
   var $90=$89 & 1;
   var $91=(($90)|(0))==0;
   if ($91) { var $is_dst_type_derived_from_static_type_2_off0 = 1;var $does_dst_type_point_to_our_static_type_0_off0_lcssa = $does_dst_type_point_to_our_static_type_0_off087;label = 22; break; } else { var $is_dst_type_derived_from_static_type_1_off0 = 1;var $does_dst_type_point_to_our_static_type_1_off0 = $does_dst_type_point_to_our_static_type_0_off087;label = 21; break; }
  case 21: 
   var $does_dst_type_point_to_our_static_type_1_off0;
   var $is_dst_type_derived_from_static_type_1_off0;
   var $93=(($p_088+8)|0);
   var $94=(($93)>>>(0)) < (($40)>>>(0));
   if ($94) { var $does_dst_type_point_to_our_static_type_0_off087 = $does_dst_type_point_to_our_static_type_1_off0;var $p_088 = $93;var $is_dst_type_derived_from_static_type_0_off089 = $is_dst_type_derived_from_static_type_1_off0;label = 13; break; } else { var $is_dst_type_derived_from_static_type_2_off0 = $is_dst_type_derived_from_static_type_1_off0;var $does_dst_type_point_to_our_static_type_0_off0_lcssa = $does_dst_type_point_to_our_static_type_1_off0;label = 22; break; }
  case 22: 
   var $does_dst_type_point_to_our_static_type_0_off0_lcssa;
   var $is_dst_type_derived_from_static_type_2_off0;
   if ($does_dst_type_point_to_our_static_type_0_off0_lcssa) { var $is_dst_type_derived_from_static_type_2_off099 = $is_dst_type_derived_from_static_type_2_off0;label = 26; break; } else { var $is_dst_type_derived_from_static_type_2_off098 = $is_dst_type_derived_from_static_type_2_off0;label = 23; break; }
  case 23: 
   var $is_dst_type_derived_from_static_type_2_off098;
   HEAP32[(($25)>>2)]=$current_ptr;
   var $95=(($info+40)|0);
   var $96=HEAP32[(($95)>>2)];
   var $97=((($96)+(1))|0);
   HEAP32[(($95)>>2)]=$97;
   var $98=(($info+36)|0);
   var $99=HEAP32[(($98)>>2)];
   var $100=(($99)|(0))==1;
   if ($100) { label = 24; break; } else { var $is_dst_type_derived_from_static_type_2_off099 = $is_dst_type_derived_from_static_type_2_off098;label = 26; break; }
  case 24: 
   var $102=(($info+24)|0);
   var $103=HEAP32[(($102)>>2)];
   var $104=(($103)|(0))==2;
   if ($104) { label = 25; break; } else { var $is_dst_type_derived_from_static_type_2_off099 = $is_dst_type_derived_from_static_type_2_off098;label = 26; break; }
  case 25: 
   var $106=(($info+54)|0);
   HEAP8[($106)]=1;
   if ($is_dst_type_derived_from_static_type_2_off098) { label = 27; break; } else { label = 28; break; }
  case 26: 
   var $is_dst_type_derived_from_static_type_2_off099;
   if ($is_dst_type_derived_from_static_type_2_off099) { label = 27; break; } else { label = 28; break; }
  case 27: 
   HEAP32[(($34)>>2)]=3;
   label = 53; break;
  case 28: 
   HEAP32[(($34)>>2)]=4;
   label = 53; break;
  case 29: 
   var $110=(($this+12)|0);
   var $111=HEAP32[(($110)>>2)];
   var $112=(($this+16+($111<<3))|0);
   var $113=(($this+20)|0);
   var $114=HEAP32[(($113)>>2)];
   var $115=$114 >> 8;
   var $116=$114 & 1;
   var $117=(($116)|(0))==0;
   if ($117) { var $offset_to_base_0_i82 = $115;label = 31; break; } else { label = 30; break; }
  case 30: 
   var $119=$current_ptr;
   var $120=HEAP32[(($119)>>2)];
   var $121=(($120+$115)|0);
   var $122=$121;
   var $123=HEAP32[(($122)>>2)];
   var $offset_to_base_0_i82 = $123;label = 31; break;
  case 31: 
   var $offset_to_base_0_i82;
   var $124=(($this+16)|0);
   var $125=HEAP32[(($124)>>2)];
   var $126=$125;
   var $127=HEAP32[(($126)>>2)];
   var $128=(($127+24)|0);
   var $129=HEAP32[(($128)>>2)];
   var $130=(($current_ptr+$offset_to_base_0_i82)|0);
   var $131=$114 & 2;
   var $132=(($131)|(0))!=0;
   var $133=$132 ? $path_below : 2;
   FUNCTION_TABLE[$129]($125, $info, $130, $133, $use_strcmp);
   var $134=(($this+24)|0);
   var $135=(($111)|(0)) > 1;
   if ($135) { label = 32; break; } else { label = 53; break; }
  case 32: 
   var $137=(($this+8)|0);
   var $138=HEAP32[(($137)>>2)];
   var $139=$138 & 2;
   var $140=(($139)|(0))==0;
   if ($140) { label = 33; break; } else { label = 34; break; }
  case 33: 
   var $142=(($info+36)|0);
   var $143=HEAP32[(($142)>>2)];
   var $144=(($143)|(0))==1;
   if ($144) { label = 34; break; } else { label = 39; break; }
  case 34: 
   var $145=(($info+54)|0);
   var $146=$current_ptr;
   var $p2_0 = $134;label = 35; break;
  case 35: 
   var $p2_0;
   var $148=HEAP8[($145)];
   var $149=$148 & 1;
   var $150=(($149 << 24) >> 24)==0;
   if ($150) { label = 36; break; } else { label = 53; break; }
  case 36: 
   var $152=(($p2_0+4)|0);
   var $153=HEAP32[(($152)>>2)];
   var $154=$153 >> 8;
   var $155=$153 & 1;
   var $156=(($155)|(0))==0;
   if ($156) { var $offset_to_base_0_i79 = $154;label = 38; break; } else { label = 37; break; }
  case 37: 
   var $158=HEAP32[(($146)>>2)];
   var $159=(($158+$154)|0);
   var $160=$159;
   var $161=HEAP32[(($160)>>2)];
   var $offset_to_base_0_i79 = $161;label = 38; break;
  case 38: 
   var $offset_to_base_0_i79;
   var $162=(($p2_0)|0);
   var $163=HEAP32[(($162)>>2)];
   var $164=$163;
   var $165=HEAP32[(($164)>>2)];
   var $166=(($165+24)|0);
   var $167=HEAP32[(($166)>>2)];
   var $168=(($current_ptr+$offset_to_base_0_i79)|0);
   var $169=$153 & 2;
   var $170=(($169)|(0))!=0;
   var $171=$170 ? $path_below : 2;
   FUNCTION_TABLE[$167]($163, $info, $168, $171, $use_strcmp);
   var $172=(($p2_0+8)|0);
   var $173=(($172)>>>(0)) < (($112)>>>(0));
   if ($173) { var $p2_0 = $172;label = 35; break; } else { label = 53; break; }
  case 39: 
   var $175=$138 & 1;
   var $176=(($175)|(0))==0;
   if ($176) { label = 41; break; } else { label = 40; break; }
  case 40: 
   var $177=(($info+24)|0);
   var $178=(($info+54)|0);
   var $179=$current_ptr;
   var $p2_1 = $134;label = 42; break;
  case 41: 
   var $180=(($info+54)|0);
   var $181=$current_ptr;
   var $p2_2 = $134;label = 48; break;
  case 42: 
   var $p2_1;
   var $183=HEAP8[($178)];
   var $184=$183 & 1;
   var $185=(($184 << 24) >> 24)==0;
   if ($185) { label = 43; break; } else { label = 53; break; }
  case 43: 
   var $187=HEAP32[(($142)>>2)];
   var $188=(($187)|(0))==1;
   if ($188) { label = 44; break; } else { label = 45; break; }
  case 44: 
   var $190=HEAP32[(($177)>>2)];
   var $191=(($190)|(0))==1;
   if ($191) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $193=(($p2_1+4)|0);
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 >> 8;
   var $196=$194 & 1;
   var $197=(($196)|(0))==0;
   if ($197) { var $offset_to_base_0_i77 = $195;label = 47; break; } else { label = 46; break; }
  case 46: 
   var $199=HEAP32[(($179)>>2)];
   var $200=(($199+$195)|0);
   var $201=$200;
   var $202=HEAP32[(($201)>>2)];
   var $offset_to_base_0_i77 = $202;label = 47; break;
  case 47: 
   var $offset_to_base_0_i77;
   var $203=(($p2_1)|0);
   var $204=HEAP32[(($203)>>2)];
   var $205=$204;
   var $206=HEAP32[(($205)>>2)];
   var $207=(($206+24)|0);
   var $208=HEAP32[(($207)>>2)];
   var $209=(($current_ptr+$offset_to_base_0_i77)|0);
   var $210=$194 & 2;
   var $211=(($210)|(0))!=0;
   var $212=$211 ? $path_below : 2;
   FUNCTION_TABLE[$208]($204, $info, $209, $212, $use_strcmp);
   var $213=(($p2_1+8)|0);
   var $214=(($213)>>>(0)) < (($112)>>>(0));
   if ($214) { var $p2_1 = $213;label = 42; break; } else { label = 53; break; }
  case 48: 
   var $p2_2;
   var $216=HEAP8[($180)];
   var $217=$216 & 1;
   var $218=(($217 << 24) >> 24)==0;
   if ($218) { label = 49; break; } else { label = 53; break; }
  case 49: 
   var $220=HEAP32[(($142)>>2)];
   var $221=(($220)|(0))==1;
   if ($221) { label = 53; break; } else { label = 50; break; }
  case 50: 
   var $223=(($p2_2+4)|0);
   var $224=HEAP32[(($223)>>2)];
   var $225=$224 >> 8;
   var $226=$224 & 1;
   var $227=(($226)|(0))==0;
   if ($227) { var $offset_to_base_0_i = $225;label = 52; break; } else { label = 51; break; }
  case 51: 
   var $229=HEAP32[(($181)>>2)];
   var $230=(($229+$225)|0);
   var $231=$230;
   var $232=HEAP32[(($231)>>2)];
   var $offset_to_base_0_i = $232;label = 52; break;
  case 52: 
   var $offset_to_base_0_i;
   var $233=(($p2_2)|0);
   var $234=HEAP32[(($233)>>2)];
   var $235=$234;
   var $236=HEAP32[(($235)>>2)];
   var $237=(($236+24)|0);
   var $238=HEAP32[(($237)>>2)];
   var $239=(($current_ptr+$offset_to_base_0_i)|0);
   var $240=$224 & 2;
   var $241=(($240)|(0))!=0;
   var $242=$241 ? $path_below : 2;
   FUNCTION_TABLE[$238]($234, $info, $239, $242, $use_strcmp);
   var $243=(($p2_2+8)|0);
   var $244=(($243)>>>(0)) < (($112)>>>(0));
   if ($244) { var $p2_2 = $243;label = 48; break; } else { label = 53; break; }
  case 53: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($info+8)|0);
   var $2=HEAP32[(($1)>>2)];
   var $3=(($2)|(0))==(($this)|(0));
   if ($3) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $5=(($info+4)|0);
   var $6=HEAP32[(($5)>>2)];
   var $7=(($6)|(0))==(($current_ptr)|(0));
   if ($7) { label = 3; break; } else { label = 14; break; }
  case 3: 
   var $9=(($info+28)|0);
   var $10=HEAP32[(($9)>>2)];
   var $11=(($10)|(0))==1;
   if ($11) { label = 14; break; } else { label = 4; break; }
  case 4: 
   HEAP32[(($9)>>2)]=$path_below;
   label = 14; break;
  case 5: 
   var $14=(($info)|0);
   var $15=HEAP32[(($14)>>2)];
   var $16=(($15)|(0))==(($this)|(0));
   if ($16) { label = 6; break; } else { label = 14; break; }
  case 6: 
   var $18=(($info+16)|0);
   var $19=HEAP32[(($18)>>2)];
   var $20=(($19)|(0))==(($current_ptr)|(0));
   if ($20) { label = 8; break; } else { label = 7; break; }
  case 7: 
   var $22=(($info+20)|0);
   var $23=HEAP32[(($22)>>2)];
   var $24=(($23)|(0))==(($current_ptr)|(0));
   if ($24) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $26=(($path_below)|(0))==1;
   if ($26) { label = 9; break; } else { label = 14; break; }
  case 9: 
   var $28=(($info+32)|0);
   HEAP32[(($28)>>2)]=1;
   label = 14; break;
  case 10: 
   var $30=(($info+32)|0);
   HEAP32[(($30)>>2)]=$path_below;
   HEAP32[(($22)>>2)]=$current_ptr;
   var $31=(($info+40)|0);
   var $32=HEAP32[(($31)>>2)];
   var $33=((($32)+(1))|0);
   HEAP32[(($31)>>2)]=$33;
   var $34=(($info+36)|0);
   var $35=HEAP32[(($34)>>2)];
   var $36=(($35)|(0))==1;
   if ($36) { label = 11; break; } else { label = 13; break; }
  case 11: 
   var $38=(($info+24)|0);
   var $39=HEAP32[(($38)>>2)];
   var $40=(($39)|(0))==2;
   if ($40) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $42=(($info+54)|0);
   HEAP8[($42)]=1;
   label = 13; break;
  case 13: 
   var $44=(($info+44)|0);
   HEAP32[(($44)>>2)]=4;
   label = 14; break;
  case 14: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($info+8)|0);
   var $2=HEAP32[(($1)>>2)];
   var $3=(($2)|(0))==(($this)|(0));
   if ($3) { label = 2; break; } else { label = 12; break; }
  case 2: 
   var $5=(($info+53)|0);
   HEAP8[($5)]=1;
   var $6=(($info+4)|0);
   var $7=HEAP32[(($6)>>2)];
   var $8=(($7)|(0))==(($current_ptr)|(0));
   if ($8) { label = 3; break; } else { label = 12; break; }
  case 3: 
   var $10=(($info+52)|0);
   HEAP8[($10)]=1;
   var $11=(($info+16)|0);
   var $12=HEAP32[(($11)>>2)];
   var $13=(($12)|(0))==0;
   if ($13) { label = 4; break; } else { label = 6; break; }
  case 4: 
   HEAP32[(($11)>>2)]=$dst_ptr;
   var $15=(($info+24)|0);
   HEAP32[(($15)>>2)]=$path_below;
   var $16=(($info+36)|0);
   HEAP32[(($16)>>2)]=1;
   var $17=(($info+48)|0);
   var $18=HEAP32[(($17)>>2)];
   var $19=(($18)|(0))==1;
   var $20=(($path_below)|(0))==1;
   var $or_cond_i=$19 & $20;
   if ($or_cond_i) { label = 5; break; } else { label = 12; break; }
  case 5: 
   var $22=(($info+54)|0);
   HEAP8[($22)]=1;
   label = 12; break;
  case 6: 
   var $24=(($12)|(0))==(($dst_ptr)|(0));
   if ($24) { label = 7; break; } else { label = 11; break; }
  case 7: 
   var $26=(($info+24)|0);
   var $27=HEAP32[(($26)>>2)];
   var $28=(($27)|(0))==2;
   if ($28) { label = 8; break; } else { var $31 = $27;label = 9; break; }
  case 8: 
   HEAP32[(($26)>>2)]=$path_below;
   var $31 = $path_below;label = 9; break;
  case 9: 
   var $31;
   var $32=(($info+48)|0);
   var $33=HEAP32[(($32)>>2)];
   var $34=(($33)|(0))==1;
   var $35=(($31)|(0))==1;
   var $or_cond23_i=$34 & $35;
   if ($or_cond23_i) { label = 10; break; } else { label = 12; break; }
  case 10: 
   var $37=(($info+54)|0);
   HEAP8[($37)]=1;
   label = 12; break;
  case 11: 
   var $39=(($info+36)|0);
   var $40=HEAP32[(($39)>>2)];
   var $41=((($40)+(1))|0);
   HEAP32[(($39)>>2)]=$41;
   var $42=(($info+54)|0);
   HEAP8[($42)]=1;
   label = 12; break;
  case 12: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this, $info, $current_ptr, $path_below, $use_strcmp) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|0);
   var $2=(($info+8)|0);
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|0);
   var $5=(($1)|(0))==(($4)|(0));
   if ($5) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $7=(($info+4)|0);
   var $8=HEAP32[(($7)>>2)];
   var $9=(($8)|(0))==(($current_ptr)|(0));
   if ($9) { label = 3; break; } else { label = 20; break; }
  case 3: 
   var $11=(($info+28)|0);
   var $12=HEAP32[(($11)>>2)];
   var $13=(($12)|(0))==1;
   if ($13) { label = 20; break; } else { label = 4; break; }
  case 4: 
   HEAP32[(($11)>>2)]=$path_below;
   label = 20; break;
  case 5: 
   var $16=(($info)|0);
   var $17=HEAP32[(($16)>>2)];
   var $18=(($17)|0);
   var $19=(($1)|(0))==(($18)|(0));
   if ($19) { label = 6; break; } else { label = 19; break; }
  case 6: 
   var $21=(($info+16)|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22)|(0))==(($current_ptr)|(0));
   if ($23) { label = 8; break; } else { label = 7; break; }
  case 7: 
   var $25=(($info+20)|0);
   var $26=HEAP32[(($25)>>2)];
   var $27=(($26)|(0))==(($current_ptr)|(0));
   if ($27) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $29=(($path_below)|(0))==1;
   if ($29) { label = 9; break; } else { label = 20; break; }
  case 9: 
   var $31=(($info+32)|0);
   HEAP32[(($31)>>2)]=1;
   label = 20; break;
  case 10: 
   var $33=(($info+32)|0);
   HEAP32[(($33)>>2)]=$path_below;
   var $34=(($info+44)|0);
   var $35=HEAP32[(($34)>>2)];
   var $36=(($35)|(0))==4;
   if ($36) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $38=(($info+52)|0);
   HEAP8[($38)]=0;
   var $39=(($info+53)|0);
   HEAP8[($39)]=0;
   var $40=(($this+8)|0);
   var $41=HEAP32[(($40)>>2)];
   var $42=$41;
   var $43=HEAP32[(($42)>>2)];
   var $44=(($43+20)|0);
   var $45=HEAP32[(($44)>>2)];
   FUNCTION_TABLE[$45]($41, $info, $current_ptr, $current_ptr, 1, $use_strcmp);
   var $46=HEAP8[($39)];
   var $47=$46 & 1;
   var $48=(($47 << 24) >> 24)==0;
   if ($48) { var $is_dst_type_derived_from_static_type_0_off036 = 0;label = 13; break; } else { label = 12; break; }
  case 12: 
   var $50=HEAP8[($38)];
   var $51=$50 & 1;
   var $not_=(($51 << 24) >> 24)==0;
   if ($not_) { var $is_dst_type_derived_from_static_type_0_off036 = 1;label = 13; break; } else { label = 17; break; }
  case 13: 
   var $is_dst_type_derived_from_static_type_0_off036;
   HEAP32[(($25)>>2)]=$current_ptr;
   var $52=(($info+40)|0);
   var $53=HEAP32[(($52)>>2)];
   var $54=((($53)+(1))|0);
   HEAP32[(($52)>>2)]=$54;
   var $55=(($info+36)|0);
   var $56=HEAP32[(($55)>>2)];
   var $57=(($56)|(0))==1;
   if ($57) { label = 14; break; } else { label = 16; break; }
  case 14: 
   var $59=(($info+24)|0);
   var $60=HEAP32[(($59)>>2)];
   var $61=(($60)|(0))==2;
   if ($61) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $63=(($info+54)|0);
   HEAP8[($63)]=1;
   if ($is_dst_type_derived_from_static_type_0_off036) { label = 17; break; } else { label = 18; break; }
  case 16: 
   if ($is_dst_type_derived_from_static_type_0_off036) { label = 17; break; } else { label = 18; break; }
  case 17: 
   HEAP32[(($34)>>2)]=3;
   label = 20; break;
  case 18: 
   HEAP32[(($34)>>2)]=4;
   label = 20; break;
  case 19: 
   var $67=(($this+8)|0);
   var $68=HEAP32[(($67)>>2)];
   var $69=$68;
   var $70=HEAP32[(($69)>>2)];
   var $71=(($70+24)|0);
   var $72=HEAP32[(($71)>>2)];
   FUNCTION_TABLE[$72]($68, $info, $current_ptr, $path_below, $use_strcmp);
   label = 20; break;
  case 20: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|0);
   var $2=(($info+8)|0);
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|0);
   var $5=(($1)|(0))==(($4)|(0));
   if ($5) { label = 2; break; } else { label = 12; break; }
  case 2: 
   var $7=(($info+53)|0);
   HEAP8[($7)]=1;
   var $8=(($info+4)|0);
   var $9=HEAP32[(($8)>>2)];
   var $10=(($9)|(0))==(($current_ptr)|(0));
   if ($10) { label = 3; break; } else { label = 26; break; }
  case 3: 
   var $12=(($info+52)|0);
   HEAP8[($12)]=1;
   var $13=(($info+16)|0);
   var $14=HEAP32[(($13)>>2)];
   var $15=(($14)|(0))==0;
   if ($15) { label = 4; break; } else { label = 6; break; }
  case 4: 
   HEAP32[(($13)>>2)]=$dst_ptr;
   var $17=(($info+24)|0);
   HEAP32[(($17)>>2)]=$path_below;
   var $18=(($info+36)|0);
   HEAP32[(($18)>>2)]=1;
   var $19=(($info+48)|0);
   var $20=HEAP32[(($19)>>2)];
   var $21=(($20)|(0))==1;
   var $22=(($path_below)|(0))==1;
   var $or_cond_i=$21 & $22;
   if ($or_cond_i) { label = 5; break; } else { label = 26; break; }
  case 5: 
   var $24=(($info+54)|0);
   HEAP8[($24)]=1;
   label = 26; break;
  case 6: 
   var $26=(($14)|(0))==(($dst_ptr)|(0));
   if ($26) { label = 7; break; } else { label = 11; break; }
  case 7: 
   var $28=(($info+24)|0);
   var $29=HEAP32[(($28)>>2)];
   var $30=(($29)|(0))==2;
   if ($30) { label = 8; break; } else { var $33 = $29;label = 9; break; }
  case 8: 
   HEAP32[(($28)>>2)]=$path_below;
   var $33 = $path_below;label = 9; break;
  case 9: 
   var $33;
   var $34=(($info+48)|0);
   var $35=HEAP32[(($34)>>2)];
   var $36=(($35)|(0))==1;
   var $37=(($33)|(0))==1;
   var $or_cond23_i=$36 & $37;
   if ($or_cond23_i) { label = 10; break; } else { label = 26; break; }
  case 10: 
   var $39=(($info+54)|0);
   HEAP8[($39)]=1;
   label = 26; break;
  case 11: 
   var $41=(($info+36)|0);
   var $42=HEAP32[(($41)>>2)];
   var $43=((($42)+(1))|0);
   HEAP32[(($41)>>2)]=$43;
   var $44=(($info+54)|0);
   HEAP8[($44)]=1;
   label = 26; break;
  case 12: 
   var $46=(($info+52)|0);
   var $47=HEAP8[($46)];
   var $48=$47 & 1;
   var $49=(($info+53)|0);
   var $50=HEAP8[($49)];
   var $51=$50 & 1;
   var $52=(($this+12)|0);
   var $53=HEAP32[(($52)>>2)];
   var $54=(($this+16+($53<<3))|0);
   HEAP8[($46)]=0;
   HEAP8[($49)]=0;
   var $55=(($this+20)|0);
   var $56=HEAP32[(($55)>>2)];
   var $57=$56 >> 8;
   var $58=$56 & 1;
   var $59=(($58)|(0))==0;
   if ($59) { var $offset_to_base_0_i32 = $57;label = 14; break; } else { label = 13; break; }
  case 13: 
   var $61=$current_ptr;
   var $62=HEAP32[(($61)>>2)];
   var $63=(($62+$57)|0);
   var $64=$63;
   var $65=HEAP32[(($64)>>2)];
   var $offset_to_base_0_i32 = $65;label = 14; break;
  case 14: 
   var $offset_to_base_0_i32;
   var $66=(($this+16)|0);
   var $67=HEAP32[(($66)>>2)];
   var $68=$67;
   var $69=HEAP32[(($68)>>2)];
   var $70=(($69+20)|0);
   var $71=HEAP32[(($70)>>2)];
   var $72=(($current_ptr+$offset_to_base_0_i32)|0);
   var $73=$56 & 2;
   var $74=(($73)|(0))!=0;
   var $75=$74 ? $path_below : 2;
   FUNCTION_TABLE[$71]($67, $info, $dst_ptr, $72, $75, $use_strcmp);
   var $76=(($53)|(0)) > 1;
   if ($76) { label = 15; break; } else { label = 25; break; }
  case 15: 
   var $77=(($this+24)|0);
   var $78=(($info+24)|0);
   var $79=(($this+8)|0);
   var $80=(($info+54)|0);
   var $81=$current_ptr;
   var $p_0 = $77;label = 16; break;
  case 16: 
   var $p_0;
   var $83=HEAP8[($80)];
   var $84=$83 & 1;
   var $85=(($84 << 24) >> 24)==0;
   if ($85) { label = 17; break; } else { label = 25; break; }
  case 17: 
   var $87=HEAP8[($46)];
   var $88=$87 & 1;
   var $89=(($88 << 24) >> 24)==0;
   if ($89) { label = 20; break; } else { label = 18; break; }
  case 18: 
   var $91=HEAP32[(($78)>>2)];
   var $92=(($91)|(0))==1;
   if ($92) { label = 25; break; } else { label = 19; break; }
  case 19: 
   var $94=HEAP32[(($79)>>2)];
   var $95=$94 & 2;
   var $96=(($95)|(0))==0;
   if ($96) { label = 25; break; } else { label = 22; break; }
  case 20: 
   var $98=HEAP8[($49)];
   var $99=$98 & 1;
   var $100=(($99 << 24) >> 24)==0;
   if ($100) { label = 22; break; } else { label = 21; break; }
  case 21: 
   var $102=HEAP32[(($79)>>2)];
   var $103=$102 & 1;
   var $104=(($103)|(0))==0;
   if ($104) { label = 25; break; } else { label = 22; break; }
  case 22: 
   HEAP8[($46)]=0;
   HEAP8[($49)]=0;
   var $106=(($p_0+4)|0);
   var $107=HEAP32[(($106)>>2)];
   var $108=$107 >> 8;
   var $109=$107 & 1;
   var $110=(($109)|(0))==0;
   if ($110) { var $offset_to_base_0_i = $108;label = 24; break; } else { label = 23; break; }
  case 23: 
   var $112=HEAP32[(($81)>>2)];
   var $113=(($112+$108)|0);
   var $114=$113;
   var $115=HEAP32[(($114)>>2)];
   var $offset_to_base_0_i = $115;label = 24; break;
  case 24: 
   var $offset_to_base_0_i;
   var $116=(($p_0)|0);
   var $117=HEAP32[(($116)>>2)];
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=(($119+20)|0);
   var $121=HEAP32[(($120)>>2)];
   var $122=(($current_ptr+$offset_to_base_0_i)|0);
   var $123=$107 & 2;
   var $124=(($123)|(0))!=0;
   var $125=$124 ? $path_below : 2;
   FUNCTION_TABLE[$121]($117, $info, $dst_ptr, $122, $125, $use_strcmp);
   var $126=(($p_0+8)|0);
   var $127=(($126)>>>(0)) < (($54)>>>(0));
   if ($127) { var $p_0 = $126;label = 16; break; } else { label = 25; break; }
  case 25: 
   HEAP8[($46)]=$48;
   HEAP8[($49)]=$51;
   label = 26; break;
  case 26: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($this)|0);
   var $2=(($info+8)|0);
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|0);
   var $5=(($1)|(0))==(($4)|(0));
   if ($5) { label = 2; break; } else { label = 12; break; }
  case 2: 
   var $7=(($info+53)|0);
   HEAP8[($7)]=1;
   var $8=(($info+4)|0);
   var $9=HEAP32[(($8)>>2)];
   var $10=(($9)|(0))==(($current_ptr)|(0));
   if ($10) { label = 3; break; } else { label = 13; break; }
  case 3: 
   var $12=(($info+52)|0);
   HEAP8[($12)]=1;
   var $13=(($info+16)|0);
   var $14=HEAP32[(($13)>>2)];
   var $15=(($14)|(0))==0;
   if ($15) { label = 4; break; } else { label = 6; break; }
  case 4: 
   HEAP32[(($13)>>2)]=$dst_ptr;
   var $17=(($info+24)|0);
   HEAP32[(($17)>>2)]=$path_below;
   var $18=(($info+36)|0);
   HEAP32[(($18)>>2)]=1;
   var $19=(($info+48)|0);
   var $20=HEAP32[(($19)>>2)];
   var $21=(($20)|(0))==1;
   var $22=(($path_below)|(0))==1;
   var $or_cond_i=$21 & $22;
   if ($or_cond_i) { label = 5; break; } else { label = 13; break; }
  case 5: 
   var $24=(($info+54)|0);
   HEAP8[($24)]=1;
   label = 13; break;
  case 6: 
   var $26=(($14)|(0))==(($dst_ptr)|(0));
   if ($26) { label = 7; break; } else { label = 11; break; }
  case 7: 
   var $28=(($info+24)|0);
   var $29=HEAP32[(($28)>>2)];
   var $30=(($29)|(0))==2;
   if ($30) { label = 8; break; } else { var $33 = $29;label = 9; break; }
  case 8: 
   HEAP32[(($28)>>2)]=$path_below;
   var $33 = $path_below;label = 9; break;
  case 9: 
   var $33;
   var $34=(($info+48)|0);
   var $35=HEAP32[(($34)>>2)];
   var $36=(($35)|(0))==1;
   var $37=(($33)|(0))==1;
   var $or_cond23_i=$36 & $37;
   if ($or_cond23_i) { label = 10; break; } else { label = 13; break; }
  case 10: 
   var $39=(($info+54)|0);
   HEAP8[($39)]=1;
   label = 13; break;
  case 11: 
   var $41=(($info+36)|0);
   var $42=HEAP32[(($41)>>2)];
   var $43=((($42)+(1))|0);
   HEAP32[(($41)>>2)]=$43;
   var $44=(($info+54)|0);
   HEAP8[($44)]=1;
   label = 13; break;
  case 12: 
   var $46=(($this+8)|0);
   var $47=HEAP32[(($46)>>2)];
   var $48=$47;
   var $49=HEAP32[(($48)>>2)];
   var $50=(($49+20)|0);
   var $51=HEAP32[(($50)>>2)];
   FUNCTION_TABLE[$51]($47, $info, $dst_ptr, $current_ptr, $path_below, $use_strcmp);
   label = 13; break;
  case 13: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($bytes)>>>(0)) < 245;
   if ($1) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $3=(($bytes)>>>(0)) < 11;
   if ($3) { var $8 = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $5=((($bytes)+(11))|0);
   var $6=$5 & -8;
   var $8 = $6;label = 4; break;
  case 4: 
   var $8;
   var $9=$8 >>> 3;
   var $10=HEAP32[((((1072)|0))>>2)];
   var $11=$10 >>> (($9)>>>(0));
   var $12=$11 & 3;
   var $13=(($12)|(0))==0;
   if ($13) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $15=$11 & 1;
   var $16=$15 ^ 1;
   var $17=((($16)+($9))|0);
   var $18=$17 << 1;
   var $19=((1112+($18<<2))|0);
   var $20=$19;
   var $_sum111=((($18)+(2))|0);
   var $21=((1112+($_sum111<<2))|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22+8)|0);
   var $24=HEAP32[(($23)>>2)];
   var $25=(($20)|(0))==(($24)|(0));
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=1 << $17;
   var $28=$27 ^ -1;
   var $29=$10 & $28;
   HEAP32[((((1072)|0))>>2)]=$29;
   label = 11; break;
  case 7: 
   var $31=$24;
   var $32=HEAP32[((((1088)|0))>>2)];
   var $33=(($31)>>>(0)) < (($32)>>>(0));
   if ($33) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $35=(($24+12)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=(($36)|(0))==(($22)|(0));
   if ($37) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($35)>>2)]=$20;
   HEAP32[(($21)>>2)]=$24;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $40=$17 << 3;
   var $41=$40 | 3;
   var $42=(($22+4)|0);
   HEAP32[(($42)>>2)]=$41;
   var $43=$22;
   var $_sum113114=$40 | 4;
   var $44=(($43+$_sum113114)|0);
   var $45=$44;
   var $46=HEAP32[(($45)>>2)];
   var $47=$46 | 1;
   HEAP32[(($45)>>2)]=$47;
   var $48=$23;
   var $mem_0 = $48;label = 341; break;
  case 12: 
   var $50=HEAP32[((((1080)|0))>>2)];
   var $51=(($8)>>>(0)) > (($50)>>>(0));
   if ($51) { label = 13; break; } else { var $nb_0 = $8;label = 160; break; }
  case 13: 
   var $53=(($11)|(0))==0;
   if ($53) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $55=$11 << $9;
   var $56=2 << $9;
   var $57=(((-$56))|0);
   var $58=$56 | $57;
   var $59=$55 & $58;
   var $60=(((-$59))|0);
   var $61=$59 & $60;
   var $62=((($61)-(1))|0);
   var $63=$62 >>> 12;
   var $64=$63 & 16;
   var $65=$62 >>> (($64)>>>(0));
   var $66=$65 >>> 5;
   var $67=$66 & 8;
   var $68=$67 | $64;
   var $69=$65 >>> (($67)>>>(0));
   var $70=$69 >>> 2;
   var $71=$70 & 4;
   var $72=$68 | $71;
   var $73=$69 >>> (($71)>>>(0));
   var $74=$73 >>> 1;
   var $75=$74 & 2;
   var $76=$72 | $75;
   var $77=$73 >>> (($75)>>>(0));
   var $78=$77 >>> 1;
   var $79=$78 & 1;
   var $80=$76 | $79;
   var $81=$77 >>> (($79)>>>(0));
   var $82=((($80)+($81))|0);
   var $83=$82 << 1;
   var $84=((1112+($83<<2))|0);
   var $85=$84;
   var $_sum104=((($83)+(2))|0);
   var $86=((1112+($_sum104<<2))|0);
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($85)|(0))==(($89)|(0));
   if ($90) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $92=1 << $82;
   var $93=$92 ^ -1;
   var $94=$10 & $93;
   HEAP32[((((1072)|0))>>2)]=$94;
   label = 20; break;
  case 16: 
   var $96=$89;
   var $97=HEAP32[((((1088)|0))>>2)];
   var $98=(($96)>>>(0)) < (($97)>>>(0));
   if ($98) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $100=(($89+12)|0);
   var $101=HEAP32[(($100)>>2)];
   var $102=(($101)|(0))==(($87)|(0));
   if ($102) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($100)>>2)]=$85;
   HEAP32[(($86)>>2)]=$89;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $105=$82 << 3;
   var $106=((($105)-($8))|0);
   var $107=$8 | 3;
   var $108=(($87+4)|0);
   HEAP32[(($108)>>2)]=$107;
   var $109=$87;
   var $110=(($109+$8)|0);
   var $111=$110;
   var $112=$106 | 1;
   var $_sum106107=$8 | 4;
   var $113=(($109+$_sum106107)|0);
   var $114=$113;
   HEAP32[(($114)>>2)]=$112;
   var $115=(($109+$105)|0);
   var $116=$115;
   HEAP32[(($116)>>2)]=$106;
   var $117=HEAP32[((((1080)|0))>>2)];
   var $118=(($117)|(0))==0;
   if ($118) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $120=HEAP32[((((1092)|0))>>2)];
   var $121=$117 >>> 3;
   var $122=$121 << 1;
   var $123=((1112+($122<<2))|0);
   var $124=$123;
   var $125=HEAP32[((((1072)|0))>>2)];
   var $126=1 << $121;
   var $127=$125 & $126;
   var $128=(($127)|(0))==0;
   if ($128) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $130=$125 | $126;
   HEAP32[((((1072)|0))>>2)]=$130;
   var $_sum109_pre=((($122)+(2))|0);
   var $_pre=((1112+($_sum109_pre<<2))|0);
   var $F4_0 = $124;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $_sum110=((($122)+(2))|0);
   var $132=((1112+($_sum110<<2))|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$133;
   var $135=HEAP32[((((1088)|0))>>2)];
   var $136=(($134)>>>(0)) < (($135)>>>(0));
   if ($136) { label = 24; break; } else { var $F4_0 = $133;var $_pre_phi = $132;label = 25; break; }
  case 24: 
   _abort();
   throw "Reached an unreachable!";
  case 25: 
   var $_pre_phi;
   var $F4_0;
   HEAP32[(($_pre_phi)>>2)]=$120;
   var $139=(($F4_0+12)|0);
   HEAP32[(($139)>>2)]=$120;
   var $140=(($120+8)|0);
   HEAP32[(($140)>>2)]=$F4_0;
   var $141=(($120+12)|0);
   HEAP32[(($141)>>2)]=$124;
   label = 26; break;
  case 26: 
   HEAP32[((((1080)|0))>>2)]=$106;
   HEAP32[((((1092)|0))>>2)]=$111;
   var $143=$88;
   var $mem_0 = $143;label = 341; break;
  case 27: 
   var $145=HEAP32[((((1076)|0))>>2)];
   var $146=(($145)|(0))==0;
   if ($146) { var $nb_0 = $8;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $148=(((-$145))|0);
   var $149=$145 & $148;
   var $150=((($149)-(1))|0);
   var $151=$150 >>> 12;
   var $152=$151 & 16;
   var $153=$150 >>> (($152)>>>(0));
   var $154=$153 >>> 5;
   var $155=$154 & 8;
   var $156=$155 | $152;
   var $157=$153 >>> (($155)>>>(0));
   var $158=$157 >>> 2;
   var $159=$158 & 4;
   var $160=$156 | $159;
   var $161=$157 >>> (($159)>>>(0));
   var $162=$161 >>> 1;
   var $163=$162 & 2;
   var $164=$160 | $163;
   var $165=$161 >>> (($163)>>>(0));
   var $166=$165 >>> 1;
   var $167=$166 & 1;
   var $168=$164 | $167;
   var $169=$165 >>> (($167)>>>(0));
   var $170=((($168)+($169))|0);
   var $171=((1376+($170<<2))|0);
   var $172=HEAP32[(($171)>>2)];
   var $173=(($172+4)|0);
   var $174=HEAP32[(($173)>>2)];
   var $175=$174 & -8;
   var $176=((($175)-($8))|0);
   var $t_0_i = $172;var $v_0_i = $172;var $rsize_0_i = $176;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $178=(($t_0_i+16)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=(($179)|(0))==0;
   if ($180) { label = 30; break; } else { var $185 = $179;label = 31; break; }
  case 30: 
   var $182=(($t_0_i+20)|0);
   var $183=HEAP32[(($182)>>2)];
   var $184=(($183)|(0))==0;
   if ($184) { label = 32; break; } else { var $185 = $183;label = 31; break; }
  case 31: 
   var $185;
   var $186=(($185+4)|0);
   var $187=HEAP32[(($186)>>2)];
   var $188=$187 & -8;
   var $189=((($188)-($8))|0);
   var $190=(($189)>>>(0)) < (($rsize_0_i)>>>(0));
   var $_rsize_0_i=$190 ? $189 : $rsize_0_i;
   var $_v_0_i=$190 ? $185 : $v_0_i;
   var $t_0_i = $185;var $v_0_i = $_v_0_i;var $rsize_0_i = $_rsize_0_i;label = 29; break;
  case 32: 
   var $192=$v_0_i;
   var $193=HEAP32[((((1088)|0))>>2)];
   var $194=(($192)>>>(0)) < (($193)>>>(0));
   if ($194) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $196=(($192+$8)|0);
   var $197=$196;
   var $198=(($192)>>>(0)) < (($196)>>>(0));
   if ($198) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $200=(($v_0_i+24)|0);
   var $201=HEAP32[(($200)>>2)];
   var $202=(($v_0_i+12)|0);
   var $203=HEAP32[(($202)>>2)];
   var $204=(($203)|(0))==(($v_0_i)|(0));
   if ($204) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $206=(($v_0_i+8)|0);
   var $207=HEAP32[(($206)>>2)];
   var $208=$207;
   var $209=(($208)>>>(0)) < (($193)>>>(0));
   if ($209) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $211=(($207+12)|0);
   var $212=HEAP32[(($211)>>2)];
   var $213=(($212)|(0))==(($v_0_i)|(0));
   if ($213) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $215=(($203+8)|0);
   var $216=HEAP32[(($215)>>2)];
   var $217=(($216)|(0))==(($v_0_i)|(0));
   if ($217) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($211)>>2)]=$203;
   HEAP32[(($215)>>2)]=$207;
   var $R_1_i = $203;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $220=(($v_0_i+20)|0);
   var $221=HEAP32[(($220)>>2)];
   var $222=(($221)|(0))==0;
   if ($222) { label = 41; break; } else { var $R_0_i = $221;var $RP_0_i = $220;label = 42; break; }
  case 41: 
   var $224=(($v_0_i+16)|0);
   var $225=HEAP32[(($224)>>2)];
   var $226=(($225)|(0))==0;
   if ($226) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $225;var $RP_0_i = $224;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $227=(($R_0_i+20)|0);
   var $228=HEAP32[(($227)>>2)];
   var $229=(($228)|(0))==0;
   if ($229) { label = 43; break; } else { var $R_0_i = $228;var $RP_0_i = $227;label = 42; break; }
  case 43: 
   var $231=(($R_0_i+16)|0);
   var $232=HEAP32[(($231)>>2)];
   var $233=(($232)|(0))==0;
   if ($233) { label = 44; break; } else { var $R_0_i = $232;var $RP_0_i = $231;label = 42; break; }
  case 44: 
   var $235=$RP_0_i;
   var $236=(($235)>>>(0)) < (($193)>>>(0));
   if ($236) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $240=(($201)|(0))==0;
   if ($240) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $242=(($v_0_i+28)|0);
   var $243=HEAP32[(($242)>>2)];
   var $244=((1376+($243<<2))|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=(($v_0_i)|(0))==(($245)|(0));
   if ($246) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($244)>>2)]=$R_1_i;
   var $cond_i=(($R_1_i)|(0))==0;
   if ($cond_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $248=HEAP32[(($242)>>2)];
   var $249=1 << $248;
   var $250=$249 ^ -1;
   var $251=HEAP32[((((1076)|0))>>2)];
   var $252=$251 & $250;
   HEAP32[((((1076)|0))>>2)]=$252;
   label = 67; break;
  case 51: 
   var $254=$201;
   var $255=HEAP32[((((1088)|0))>>2)];
   var $256=(($254)>>>(0)) < (($255)>>>(0));
   if ($256) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $258=(($201+16)|0);
   var $259=HEAP32[(($258)>>2)];
   var $260=(($259)|(0))==(($v_0_i)|(0));
   if ($260) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($258)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $263=(($201+20)|0);
   HEAP32[(($263)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $266=(($R_1_i)|(0))==0;
   if ($266) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $268=$R_1_i;
   var $269=HEAP32[((((1088)|0))>>2)];
   var $270=(($268)>>>(0)) < (($269)>>>(0));
   if ($270) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $272=(($R_1_i+24)|0);
   HEAP32[(($272)>>2)]=$201;
   var $273=(($v_0_i+16)|0);
   var $274=HEAP32[(($273)>>2)];
   var $275=(($274)|(0))==0;
   if ($275) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $277=$274;
   var $278=HEAP32[((((1088)|0))>>2)];
   var $279=(($277)>>>(0)) < (($278)>>>(0));
   if ($279) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $281=(($R_1_i+16)|0);
   HEAP32[(($281)>>2)]=$274;
   var $282=(($274+24)|0);
   HEAP32[(($282)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $285=(($v_0_i+20)|0);
   var $286=HEAP32[(($285)>>2)];
   var $287=(($286)|(0))==0;
   if ($287) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $289=$286;
   var $290=HEAP32[((((1088)|0))>>2)];
   var $291=(($289)>>>(0)) < (($290)>>>(0));
   if ($291) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $293=(($R_1_i+20)|0);
   HEAP32[(($293)>>2)]=$286;
   var $294=(($286+24)|0);
   HEAP32[(($294)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $298=(($rsize_0_i)>>>(0)) < 16;
   if ($298) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $300=((($rsize_0_i)+($8))|0);
   var $301=$300 | 3;
   var $302=(($v_0_i+4)|0);
   HEAP32[(($302)>>2)]=$301;
   var $_sum4_i=((($300)+(4))|0);
   var $303=(($192+$_sum4_i)|0);
   var $304=$303;
   var $305=HEAP32[(($304)>>2)];
   var $306=$305 | 1;
   HEAP32[(($304)>>2)]=$306;
   label = 77; break;
  case 69: 
   var $308=$8 | 3;
   var $309=(($v_0_i+4)|0);
   HEAP32[(($309)>>2)]=$308;
   var $310=$rsize_0_i | 1;
   var $_sum_i137=$8 | 4;
   var $311=(($192+$_sum_i137)|0);
   var $312=$311;
   HEAP32[(($312)>>2)]=$310;
   var $_sum1_i=((($rsize_0_i)+($8))|0);
   var $313=(($192+$_sum1_i)|0);
   var $314=$313;
   HEAP32[(($314)>>2)]=$rsize_0_i;
   var $315=HEAP32[((((1080)|0))>>2)];
   var $316=(($315)|(0))==0;
   if ($316) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $318=HEAP32[((((1092)|0))>>2)];
   var $319=$315 >>> 3;
   var $320=$319 << 1;
   var $321=((1112+($320<<2))|0);
   var $322=$321;
   var $323=HEAP32[((((1072)|0))>>2)];
   var $324=1 << $319;
   var $325=$323 & $324;
   var $326=(($325)|(0))==0;
   if ($326) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $328=$323 | $324;
   HEAP32[((((1072)|0))>>2)]=$328;
   var $_sum2_pre_i=((($320)+(2))|0);
   var $_pre_i=((1112+($_sum2_pre_i<<2))|0);
   var $F1_0_i = $322;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $_sum3_i=((($320)+(2))|0);
   var $330=((1112+($_sum3_i<<2))|0);
   var $331=HEAP32[(($330)>>2)];
   var $332=$331;
   var $333=HEAP32[((((1088)|0))>>2)];
   var $334=(($332)>>>(0)) < (($333)>>>(0));
   if ($334) { label = 73; break; } else { var $F1_0_i = $331;var $_pre_phi_i = $330;label = 74; break; }
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $_pre_phi_i;
   var $F1_0_i;
   HEAP32[(($_pre_phi_i)>>2)]=$318;
   var $337=(($F1_0_i+12)|0);
   HEAP32[(($337)>>2)]=$318;
   var $338=(($318+8)|0);
   HEAP32[(($338)>>2)]=$F1_0_i;
   var $339=(($318+12)|0);
   HEAP32[(($339)>>2)]=$322;
   label = 75; break;
  case 75: 
   HEAP32[((((1080)|0))>>2)]=$rsize_0_i;
   HEAP32[((((1092)|0))>>2)]=$197;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $342=(($v_0_i+8)|0);
   var $343=$342;
   var $344=(($342)|(0))==0;
   if ($344) { var $nb_0 = $8;label = 160; break; } else { var $mem_0 = $343;label = 341; break; }
  case 78: 
   var $346=(($bytes)>>>(0)) > 4294967231;
   if ($346) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $348=((($bytes)+(11))|0);
   var $349=$348 & -8;
   var $350=HEAP32[((((1076)|0))>>2)];
   var $351=(($350)|(0))==0;
   if ($351) { var $nb_0 = $349;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $353=(((-$349))|0);
   var $354=$348 >>> 8;
   var $355=(($354)|(0))==0;
   if ($355) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $357=(($349)>>>(0)) > 16777215;
   if ($357) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $359=((($354)+(1048320))|0);
   var $360=$359 >>> 16;
   var $361=$360 & 8;
   var $362=$354 << $361;
   var $363=((($362)+(520192))|0);
   var $364=$363 >>> 16;
   var $365=$364 & 4;
   var $366=$365 | $361;
   var $367=$362 << $365;
   var $368=((($367)+(245760))|0);
   var $369=$368 >>> 16;
   var $370=$369 & 2;
   var $371=$366 | $370;
   var $372=(((14)-($371))|0);
   var $373=$367 << $370;
   var $374=$373 >>> 15;
   var $375=((($372)+($374))|0);
   var $376=$375 << 1;
   var $377=((($375)+(7))|0);
   var $378=$349 >>> (($377)>>>(0));
   var $379=$378 & 1;
   var $380=$379 | $376;
   var $idx_0_i = $380;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $382=((1376+($idx_0_i<<2))|0);
   var $383=HEAP32[(($382)>>2)];
   var $384=(($383)|(0))==0;
   if ($384) { var $v_2_i = 0;var $rsize_2_i = $353;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $386=(($idx_0_i)|(0))==31;
   if ($386) { var $391 = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $388=$idx_0_i >>> 1;
   var $389=(((25)-($388))|0);
   var $391 = $389;label = 86; break;
  case 86: 
   var $391;
   var $392=$349 << $391;
   var $v_0_i118 = 0;var $rsize_0_i117 = $353;var $t_0_i116 = $383;var $sizebits_0_i = $392;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i116;
   var $rsize_0_i117;
   var $v_0_i118;
   var $394=(($t_0_i116+4)|0);
   var $395=HEAP32[(($394)>>2)];
   var $396=$395 & -8;
   var $397=((($396)-($349))|0);
   var $398=(($397)>>>(0)) < (($rsize_0_i117)>>>(0));
   if ($398) { label = 88; break; } else { var $v_1_i = $v_0_i118;var $rsize_1_i = $rsize_0_i117;label = 89; break; }
  case 88: 
   var $400=(($396)|(0))==(($349)|(0));
   if ($400) { var $v_2_i = $t_0_i116;var $rsize_2_i = $397;var $t_1_i = $t_0_i116;label = 90; break; } else { var $v_1_i = $t_0_i116;var $rsize_1_i = $397;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $402=(($t_0_i116+20)|0);
   var $403=HEAP32[(($402)>>2)];
   var $404=$sizebits_0_i >>> 31;
   var $405=(($t_0_i116+16+($404<<2))|0);
   var $406=HEAP32[(($405)>>2)];
   var $407=(($403)|(0))==0;
   var $408=(($403)|(0))==(($406)|(0));
   var $or_cond_i=$407 | $408;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $403;
   var $409=(($406)|(0))==0;
   var $410=$sizebits_0_i << 1;
   if ($409) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i118 = $v_1_i;var $rsize_0_i117 = $rsize_1_i;var $t_0_i116 = $406;var $sizebits_0_i = $410;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $411=(($t_1_i)|(0))==0;
   var $412=(($v_2_i)|(0))==0;
   var $or_cond21_i=$411 & $412;
   if ($or_cond21_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $414=2 << $idx_0_i;
   var $415=(((-$414))|0);
   var $416=$414 | $415;
   var $417=$350 & $416;
   var $418=(($417)|(0))==0;
   if ($418) { var $nb_0 = $349;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $420=(((-$417))|0);
   var $421=$417 & $420;
   var $422=((($421)-(1))|0);
   var $423=$422 >>> 12;
   var $424=$423 & 16;
   var $425=$422 >>> (($424)>>>(0));
   var $426=$425 >>> 5;
   var $427=$426 & 8;
   var $428=$427 | $424;
   var $429=$425 >>> (($427)>>>(0));
   var $430=$429 >>> 2;
   var $431=$430 & 4;
   var $432=$428 | $431;
   var $433=$429 >>> (($431)>>>(0));
   var $434=$433 >>> 1;
   var $435=$434 & 2;
   var $436=$432 | $435;
   var $437=$433 >>> (($435)>>>(0));
   var $438=$437 >>> 1;
   var $439=$438 & 1;
   var $440=$436 | $439;
   var $441=$437 >>> (($439)>>>(0));
   var $442=((($440)+($441))|0);
   var $443=((1376+($442<<2))|0);
   var $444=HEAP32[(($443)>>2)];
   var $t_2_ph_i = $444;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $445=(($t_2_ph_i)|(0))==0;
   if ($445) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_228_i = $t_2_ph_i;var $rsize_329_i = $rsize_2_i;var $v_330_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_330_i;
   var $rsize_329_i;
   var $t_228_i;
   var $446=(($t_228_i+4)|0);
   var $447=HEAP32[(($446)>>2)];
   var $448=$447 & -8;
   var $449=((($448)-($349))|0);
   var $450=(($449)>>>(0)) < (($rsize_329_i)>>>(0));
   var $_rsize_3_i=$450 ? $449 : $rsize_329_i;
   var $t_2_v_3_i=$450 ? $t_228_i : $v_330_i;
   var $451=(($t_228_i+16)|0);
   var $452=HEAP32[(($451)>>2)];
   var $453=(($452)|(0))==0;
   if ($453) { label = 95; break; } else { var $t_228_i = $452;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $454=(($t_228_i+20)|0);
   var $455=HEAP32[(($454)>>2)];
   var $456=(($455)|(0))==0;
   if ($456) { var $rsize_3_lcssa_i = $_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_228_i = $455;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $457=(($v_3_lcssa_i)|(0))==0;
   if ($457) { var $nb_0 = $349;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $459=HEAP32[((((1080)|0))>>2)];
   var $460=((($459)-($349))|0);
   var $461=(($rsize_3_lcssa_i)>>>(0)) < (($460)>>>(0));
   if ($461) { label = 98; break; } else { var $nb_0 = $349;label = 160; break; }
  case 98: 
   var $463=$v_3_lcssa_i;
   var $464=HEAP32[((((1088)|0))>>2)];
   var $465=(($463)>>>(0)) < (($464)>>>(0));
   if ($465) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $467=(($463+$349)|0);
   var $468=$467;
   var $469=(($463)>>>(0)) < (($467)>>>(0));
   if ($469) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $471=(($v_3_lcssa_i+24)|0);
   var $472=HEAP32[(($471)>>2)];
   var $473=(($v_3_lcssa_i+12)|0);
   var $474=HEAP32[(($473)>>2)];
   var $475=(($474)|(0))==(($v_3_lcssa_i)|(0));
   if ($475) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $477=(($v_3_lcssa_i+8)|0);
   var $478=HEAP32[(($477)>>2)];
   var $479=$478;
   var $480=(($479)>>>(0)) < (($464)>>>(0));
   if ($480) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $482=(($478+12)|0);
   var $483=HEAP32[(($482)>>2)];
   var $484=(($483)|(0))==(($v_3_lcssa_i)|(0));
   if ($484) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $486=(($474+8)|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=(($487)|(0))==(($v_3_lcssa_i)|(0));
   if ($488) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($482)>>2)]=$474;
   HEAP32[(($486)>>2)]=$478;
   var $R_1_i122 = $474;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $491=(($v_3_lcssa_i+20)|0);
   var $492=HEAP32[(($491)>>2)];
   var $493=(($492)|(0))==0;
   if ($493) { label = 107; break; } else { var $R_0_i120 = $492;var $RP_0_i119 = $491;label = 108; break; }
  case 107: 
   var $495=(($v_3_lcssa_i+16)|0);
   var $496=HEAP32[(($495)>>2)];
   var $497=(($496)|(0))==0;
   if ($497) { var $R_1_i122 = 0;label = 113; break; } else { var $R_0_i120 = $496;var $RP_0_i119 = $495;label = 108; break; }
  case 108: 
   var $RP_0_i119;
   var $R_0_i120;
   var $498=(($R_0_i120+20)|0);
   var $499=HEAP32[(($498)>>2)];
   var $500=(($499)|(0))==0;
   if ($500) { label = 109; break; } else { var $R_0_i120 = $499;var $RP_0_i119 = $498;label = 108; break; }
  case 109: 
   var $502=(($R_0_i120+16)|0);
   var $503=HEAP32[(($502)>>2)];
   var $504=(($503)|(0))==0;
   if ($504) { label = 110; break; } else { var $R_0_i120 = $503;var $RP_0_i119 = $502;label = 108; break; }
  case 110: 
   var $506=$RP_0_i119;
   var $507=(($506)>>>(0)) < (($464)>>>(0));
   if ($507) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i119)>>2)]=0;
   var $R_1_i122 = $R_0_i120;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i122;
   var $511=(($472)|(0))==0;
   if ($511) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $513=(($v_3_lcssa_i+28)|0);
   var $514=HEAP32[(($513)>>2)];
   var $515=((1376+($514<<2))|0);
   var $516=HEAP32[(($515)>>2)];
   var $517=(($v_3_lcssa_i)|(0))==(($516)|(0));
   if ($517) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($515)>>2)]=$R_1_i122;
   var $cond_i123=(($R_1_i122)|(0))==0;
   if ($cond_i123) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $519=HEAP32[(($513)>>2)];
   var $520=1 << $519;
   var $521=$520 ^ -1;
   var $522=HEAP32[((((1076)|0))>>2)];
   var $523=$522 & $521;
   HEAP32[((((1076)|0))>>2)]=$523;
   label = 133; break;
  case 117: 
   var $525=$472;
   var $526=HEAP32[((((1088)|0))>>2)];
   var $527=(($525)>>>(0)) < (($526)>>>(0));
   if ($527) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $529=(($472+16)|0);
   var $530=HEAP32[(($529)>>2)];
   var $531=(($530)|(0))==(($v_3_lcssa_i)|(0));
   if ($531) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($529)>>2)]=$R_1_i122;
   label = 122; break;
  case 120: 
   var $534=(($472+20)|0);
   HEAP32[(($534)>>2)]=$R_1_i122;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $537=(($R_1_i122)|(0))==0;
   if ($537) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $539=$R_1_i122;
   var $540=HEAP32[((((1088)|0))>>2)];
   var $541=(($539)>>>(0)) < (($540)>>>(0));
   if ($541) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $543=(($R_1_i122+24)|0);
   HEAP32[(($543)>>2)]=$472;
   var $544=(($v_3_lcssa_i+16)|0);
   var $545=HEAP32[(($544)>>2)];
   var $546=(($545)|(0))==0;
   if ($546) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $548=$545;
   var $549=HEAP32[((((1088)|0))>>2)];
   var $550=(($548)>>>(0)) < (($549)>>>(0));
   if ($550) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $552=(($R_1_i122+16)|0);
   HEAP32[(($552)>>2)]=$545;
   var $553=(($545+24)|0);
   HEAP32[(($553)>>2)]=$R_1_i122;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $556=(($v_3_lcssa_i+20)|0);
   var $557=HEAP32[(($556)>>2)];
   var $558=(($557)|(0))==0;
   if ($558) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $560=$557;
   var $561=HEAP32[((((1088)|0))>>2)];
   var $562=(($560)>>>(0)) < (($561)>>>(0));
   if ($562) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $564=(($R_1_i122+20)|0);
   HEAP32[(($564)>>2)]=$557;
   var $565=(($557+24)|0);
   HEAP32[(($565)>>2)]=$R_1_i122;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $569=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($569) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $571=((($rsize_3_lcssa_i)+($349))|0);
   var $572=$571 | 3;
   var $573=(($v_3_lcssa_i+4)|0);
   HEAP32[(($573)>>2)]=$572;
   var $_sum19_i=((($571)+(4))|0);
   var $574=(($463+$_sum19_i)|0);
   var $575=$574;
   var $576=HEAP32[(($575)>>2)];
   var $577=$576 | 1;
   HEAP32[(($575)>>2)]=$577;
   label = 159; break;
  case 135: 
   var $579=$349 | 3;
   var $580=(($v_3_lcssa_i+4)|0);
   HEAP32[(($580)>>2)]=$579;
   var $581=$rsize_3_lcssa_i | 1;
   var $_sum_i125136=$349 | 4;
   var $582=(($463+$_sum_i125136)|0);
   var $583=$582;
   HEAP32[(($583)>>2)]=$581;
   var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
   var $584=(($463+$_sum1_i126)|0);
   var $585=$584;
   HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
   var $586=$rsize_3_lcssa_i >>> 3;
   var $587=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($587) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $589=$586 << 1;
   var $590=((1112+($589<<2))|0);
   var $591=$590;
   var $592=HEAP32[((((1072)|0))>>2)];
   var $593=1 << $586;
   var $594=$592 & $593;
   var $595=(($594)|(0))==0;
   if ($595) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $597=$592 | $593;
   HEAP32[((((1072)|0))>>2)]=$597;
   var $_sum15_pre_i=((($589)+(2))|0);
   var $_pre_i127=((1112+($_sum15_pre_i<<2))|0);
   var $F5_0_i = $591;var $_pre_phi_i128 = $_pre_i127;label = 140; break;
  case 138: 
   var $_sum18_i=((($589)+(2))|0);
   var $599=((1112+($_sum18_i<<2))|0);
   var $600=HEAP32[(($599)>>2)];
   var $601=$600;
   var $602=HEAP32[((((1088)|0))>>2)];
   var $603=(($601)>>>(0)) < (($602)>>>(0));
   if ($603) { label = 139; break; } else { var $F5_0_i = $600;var $_pre_phi_i128 = $599;label = 140; break; }
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   var $_pre_phi_i128;
   var $F5_0_i;
   HEAP32[(($_pre_phi_i128)>>2)]=$468;
   var $606=(($F5_0_i+12)|0);
   HEAP32[(($606)>>2)]=$468;
   var $_sum16_i=((($349)+(8))|0);
   var $607=(($463+$_sum16_i)|0);
   var $608=$607;
   HEAP32[(($608)>>2)]=$F5_0_i;
   var $_sum17_i=((($349)+(12))|0);
   var $609=(($463+$_sum17_i)|0);
   var $610=$609;
   HEAP32[(($610)>>2)]=$591;
   label = 159; break;
  case 141: 
   var $612=$467;
   var $613=$rsize_3_lcssa_i >>> 8;
   var $614=(($613)|(0))==0;
   if ($614) { var $I7_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $616=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($616) { var $I7_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $618=((($613)+(1048320))|0);
   var $619=$618 >>> 16;
   var $620=$619 & 8;
   var $621=$613 << $620;
   var $622=((($621)+(520192))|0);
   var $623=$622 >>> 16;
   var $624=$623 & 4;
   var $625=$624 | $620;
   var $626=$621 << $624;
   var $627=((($626)+(245760))|0);
   var $628=$627 >>> 16;
   var $629=$628 & 2;
   var $630=$625 | $629;
   var $631=(((14)-($630))|0);
   var $632=$626 << $629;
   var $633=$632 >>> 15;
   var $634=((($631)+($633))|0);
   var $635=$634 << 1;
   var $636=((($634)+(7))|0);
   var $637=$rsize_3_lcssa_i >>> (($636)>>>(0));
   var $638=$637 & 1;
   var $639=$638 | $635;
   var $I7_0_i = $639;label = 144; break;
  case 144: 
   var $I7_0_i;
   var $641=((1376+($I7_0_i<<2))|0);
   var $_sum2_i=((($349)+(28))|0);
   var $642=(($463+$_sum2_i)|0);
   var $643=$642;
   HEAP32[(($643)>>2)]=$I7_0_i;
   var $_sum3_i129=((($349)+(16))|0);
   var $644=(($463+$_sum3_i129)|0);
   var $_sum4_i130=((($349)+(20))|0);
   var $645=(($463+$_sum4_i130)|0);
   var $646=$645;
   HEAP32[(($646)>>2)]=0;
   var $647=$644;
   HEAP32[(($647)>>2)]=0;
   var $648=HEAP32[((((1076)|0))>>2)];
   var $649=1 << $I7_0_i;
   var $650=$648 & $649;
   var $651=(($650)|(0))==0;
   if ($651) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $653=$648 | $649;
   HEAP32[((((1076)|0))>>2)]=$653;
   HEAP32[(($641)>>2)]=$612;
   var $654=$641;
   var $_sum5_i=((($349)+(24))|0);
   var $655=(($463+$_sum5_i)|0);
   var $656=$655;
   HEAP32[(($656)>>2)]=$654;
   var $_sum6_i=((($349)+(12))|0);
   var $657=(($463+$_sum6_i)|0);
   var $658=$657;
   HEAP32[(($658)>>2)]=$612;
   var $_sum7_i=((($349)+(8))|0);
   var $659=(($463+$_sum7_i)|0);
   var $660=$659;
   HEAP32[(($660)>>2)]=$612;
   label = 159; break;
  case 146: 
   var $662=HEAP32[(($641)>>2)];
   var $663=(($I7_0_i)|(0))==31;
   if ($663) { var $668 = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $665=$I7_0_i >>> 1;
   var $666=(((25)-($665))|0);
   var $668 = $666;label = 148; break;
  case 148: 
   var $668;
   var $669=$rsize_3_lcssa_i << $668;
   var $K12_0_i = $669;var $T_0_i = $662;label = 149; break;
  case 149: 
   var $T_0_i;
   var $K12_0_i;
   var $671=(($T_0_i+4)|0);
   var $672=HEAP32[(($671)>>2)];
   var $673=$672 & -8;
   var $674=(($673)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($674) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $676=$K12_0_i >>> 31;
   var $677=(($T_0_i+16+($676<<2))|0);
   var $678=HEAP32[(($677)>>2)];
   var $679=(($678)|(0))==0;
   var $680=$K12_0_i << 1;
   if ($679) { label = 151; break; } else { var $K12_0_i = $680;var $T_0_i = $678;label = 149; break; }
  case 151: 
   var $682=$677;
   var $683=HEAP32[((((1088)|0))>>2)];
   var $684=(($682)>>>(0)) < (($683)>>>(0));
   if ($684) { label = 153; break; } else { label = 152; break; }
  case 152: 
   HEAP32[(($677)>>2)]=$612;
   var $_sum12_i=((($349)+(24))|0);
   var $686=(($463+$_sum12_i)|0);
   var $687=$686;
   HEAP32[(($687)>>2)]=$T_0_i;
   var $_sum13_i=((($349)+(12))|0);
   var $688=(($463+$_sum13_i)|0);
   var $689=$688;
   HEAP32[(($689)>>2)]=$612;
   var $_sum14_i=((($349)+(8))|0);
   var $690=(($463+$_sum14_i)|0);
   var $691=$690;
   HEAP32[(($691)>>2)]=$612;
   label = 159; break;
  case 153: 
   _abort();
   throw "Reached an unreachable!";
  case 154: 
   var $694=(($T_0_i+8)|0);
   var $695=HEAP32[(($694)>>2)];
   var $696=$T_0_i;
   var $697=HEAP32[((((1088)|0))>>2)];
   var $698=(($696)>>>(0)) < (($697)>>>(0));
   if ($698) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $700=$695;
   var $701=(($700)>>>(0)) < (($697)>>>(0));
   if ($701) { label = 157; break; } else { label = 156; break; }
  case 156: 
   var $703=(($695+12)|0);
   HEAP32[(($703)>>2)]=$612;
   HEAP32[(($694)>>2)]=$612;
   var $_sum9_i=((($349)+(8))|0);
   var $704=(($463+$_sum9_i)|0);
   var $705=$704;
   HEAP32[(($705)>>2)]=$695;
   var $_sum10_i=((($349)+(12))|0);
   var $706=(($463+$_sum10_i)|0);
   var $707=$706;
   HEAP32[(($707)>>2)]=$T_0_i;
   var $_sum11_i=((($349)+(24))|0);
   var $708=(($463+$_sum11_i)|0);
   var $709=$708;
   HEAP32[(($709)>>2)]=0;
   label = 159; break;
  case 157: 
   _abort();
   throw "Reached an unreachable!";
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   var $711=(($v_3_lcssa_i+8)|0);
   var $712=$711;
   var $713=(($711)|(0))==0;
   if ($713) { var $nb_0 = $349;label = 160; break; } else { var $mem_0 = $712;label = 341; break; }
  case 160: 
   var $nb_0;
   var $714=HEAP32[((((1080)|0))>>2)];
   var $715=(($nb_0)>>>(0)) > (($714)>>>(0));
   if ($715) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $717=((($714)-($nb_0))|0);
   var $718=HEAP32[((((1092)|0))>>2)];
   var $719=(($717)>>>(0)) > 15;
   if ($719) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $721=$718;
   var $722=(($721+$nb_0)|0);
   var $723=$722;
   HEAP32[((((1092)|0))>>2)]=$723;
   HEAP32[((((1080)|0))>>2)]=$717;
   var $724=$717 | 1;
   var $_sum102=((($nb_0)+(4))|0);
   var $725=(($721+$_sum102)|0);
   var $726=$725;
   HEAP32[(($726)>>2)]=$724;
   var $727=(($721+$714)|0);
   var $728=$727;
   HEAP32[(($728)>>2)]=$717;
   var $729=$nb_0 | 3;
   var $730=(($718+4)|0);
   HEAP32[(($730)>>2)]=$729;
   label = 164; break;
  case 163: 
   HEAP32[((((1080)|0))>>2)]=0;
   HEAP32[((((1092)|0))>>2)]=0;
   var $732=$714 | 3;
   var $733=(($718+4)|0);
   HEAP32[(($733)>>2)]=$732;
   var $734=$718;
   var $_sum101=((($714)+(4))|0);
   var $735=(($734+$_sum101)|0);
   var $736=$735;
   var $737=HEAP32[(($736)>>2)];
   var $738=$737 | 1;
   HEAP32[(($736)>>2)]=$738;
   label = 164; break;
  case 164: 
   var $740=(($718+8)|0);
   var $741=$740;
   var $mem_0 = $741;label = 341; break;
  case 165: 
   var $743=HEAP32[((((1084)|0))>>2)];
   var $744=(($nb_0)>>>(0)) < (($743)>>>(0));
   if ($744) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $746=((($743)-($nb_0))|0);
   HEAP32[((((1084)|0))>>2)]=$746;
   var $747=HEAP32[((((1096)|0))>>2)];
   var $748=$747;
   var $749=(($748+$nb_0)|0);
   var $750=$749;
   HEAP32[((((1096)|0))>>2)]=$750;
   var $751=$746 | 1;
   var $_sum=((($nb_0)+(4))|0);
   var $752=(($748+$_sum)|0);
   var $753=$752;
   HEAP32[(($753)>>2)]=$751;
   var $754=$nb_0 | 3;
   var $755=(($747+4)|0);
   HEAP32[(($755)>>2)]=$754;
   var $756=(($747+8)|0);
   var $757=$756;
   var $mem_0 = $757;label = 341; break;
  case 167: 
   var $759=HEAP32[((((1048)|0))>>2)];
   var $760=(($759)|(0))==0;
   if ($760) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $762=_sysconf(8);
   var $763=((($762)-(1))|0);
   var $764=$763 & $762;
   var $765=(($764)|(0))==0;
   if ($765) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((1056)|0))>>2)]=$762;
   HEAP32[((((1052)|0))>>2)]=$762;
   HEAP32[((((1060)|0))>>2)]=-1;
   HEAP32[((((1064)|0))>>2)]=2097152;
   HEAP32[((((1068)|0))>>2)]=0;
   HEAP32[((((1516)|0))>>2)]=0;
   var $767=_time(0);
   var $768=$767 & -16;
   var $769=$768 ^ 1431655768;
   HEAP32[((((1048)|0))>>2)]=$769;
   label = 171; break;
  case 171: 
   var $771=((($nb_0)+(48))|0);
   var $772=HEAP32[((((1056)|0))>>2)];
   var $773=((($nb_0)+(47))|0);
   var $774=((($772)+($773))|0);
   var $775=(((-$772))|0);
   var $776=$774 & $775;
   var $777=(($776)>>>(0)) > (($nb_0)>>>(0));
   if ($777) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $779=HEAP32[((((1512)|0))>>2)];
   var $780=(($779)|(0))==0;
   if ($780) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $782=HEAP32[((((1504)|0))>>2)];
   var $783=((($782)+($776))|0);
   var $784=(($783)>>>(0)) <= (($782)>>>(0));
   var $785=(($783)>>>(0)) > (($779)>>>(0));
   var $or_cond1_i=$784 | $785;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $787=HEAP32[((((1516)|0))>>2)];
   var $788=$787 & 4;
   var $789=(($788)|(0))==0;
   if ($789) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $791=HEAP32[((((1096)|0))>>2)];
   var $792=(($791)|(0))==0;
   if ($792) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $794=$791;
   var $sp_0_i_i = ((1520)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $796=(($sp_0_i_i)|0);
   var $797=HEAP32[(($796)>>2)];
   var $798=(($797)>>>(0)) > (($794)>>>(0));
   if ($798) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $800=(($sp_0_i_i+4)|0);
   var $801=HEAP32[(($800)>>2)];
   var $802=(($797+$801)|0);
   var $803=(($802)>>>(0)) > (($794)>>>(0));
   if ($803) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $805=(($sp_0_i_i+8)|0);
   var $806=HEAP32[(($805)>>2)];
   var $807=(($806)|(0))==0;
   if ($807) { label = 181; break; } else { var $sp_0_i_i = $806;label = 177; break; }
  case 180: 
   var $808=(($sp_0_i_i)|(0))==0;
   if ($808) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $809=_sbrk(0);
   var $810=(($809)|(0))==-1;
   if ($810) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $812=$809;
   var $813=HEAP32[((((1052)|0))>>2)];
   var $814=((($813)-(1))|0);
   var $815=$814 & $812;
   var $816=(($815)|(0))==0;
   if ($816) { var $ssize_0_i = $776;label = 184; break; } else { label = 183; break; }
  case 183: 
   var $818=((($814)+($812))|0);
   var $819=(((-$813))|0);
   var $820=$818 & $819;
   var $821=((($776)-($812))|0);
   var $822=((($821)+($820))|0);
   var $ssize_0_i = $822;label = 184; break;
  case 184: 
   var $ssize_0_i;
   var $824=HEAP32[((((1504)|0))>>2)];
   var $825=((($824)+($ssize_0_i))|0);
   var $826=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $827=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i131=$826 & $827;
   if ($or_cond_i131) { label = 185; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 185: 
   var $829=HEAP32[((((1512)|0))>>2)];
   var $830=(($829)|(0))==0;
   if ($830) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $832=(($825)>>>(0)) <= (($824)>>>(0));
   var $833=(($825)>>>(0)) > (($829)>>>(0));
   var $or_cond2_i=$832 | $833;
   if ($or_cond2_i) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $835=_sbrk($ssize_0_i);
   var $836=(($835)|(0))==(($809)|(0));
   var $ssize_0__i=$836 ? $ssize_0_i : 0;
   var $__i=$836 ? $809 : -1;
   var $tbase_0_i = $__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $835;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $838=HEAP32[((((1084)|0))>>2)];
   var $839=((($774)-($838))|0);
   var $840=$839 & $775;
   var $841=(($840)>>>(0)) < 2147483647;
   if ($841) { label = 189; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 189: 
   var $843=_sbrk($840);
   var $844=HEAP32[(($796)>>2)];
   var $845=HEAP32[(($800)>>2)];
   var $846=(($844+$845)|0);
   var $847=(($843)|(0))==(($846)|(0));
   var $_3_i=$847 ? $840 : 0;
   var $_4_i=$847 ? $843 : -1;
   var $tbase_0_i = $_4_i;var $tsize_0_i = $_3_i;var $br_0_i = $843;var $ssize_1_i = $840;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $849=(((-$ssize_1_i))|0);
   var $850=(($tbase_0_i)|(0))==-1;
   if ($850) { label = 191; break; } else { var $tsize_244_i = $tsize_0_i;var $tbase_245_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $852=(($br_0_i)|(0))!=-1;
   var $853=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond5_i=$852 & $853;
   var $854=(($ssize_1_i)>>>(0)) < (($771)>>>(0));
   var $or_cond6_i=$or_cond5_i & $854;
   if ($or_cond6_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $856=HEAP32[((((1056)|0))>>2)];
   var $857=((($773)-($ssize_1_i))|0);
   var $858=((($857)+($856))|0);
   var $859=(((-$856))|0);
   var $860=$858 & $859;
   var $861=(($860)>>>(0)) < 2147483647;
   if ($861) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $863=_sbrk($860);
   var $864=(($863)|(0))==-1;
   if ($864) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $866=((($860)+($ssize_1_i))|0);
   var $ssize_2_i = $866;label = 196; break;
  case 195: 
   var $868=_sbrk($849);
   var $tsize_0303639_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $870=(($br_0_i)|(0))==-1;
   if ($870) { var $tsize_0303639_i = $tsize_0_i;label = 197; break; } else { var $tsize_244_i = $ssize_2_i;var $tbase_245_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0303639_i;
   var $871=HEAP32[((((1516)|0))>>2)];
   var $872=$871 | 4;
   HEAP32[((((1516)|0))>>2)]=$872;
   var $tsize_1_i = $tsize_0303639_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $874=(($776)>>>(0)) < 2147483647;
   if ($874) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $876=_sbrk($776);
   var $877=_sbrk(0);
   var $notlhs_i=(($876)|(0))!=-1;
   var $notrhs_i=(($877)|(0))!=-1;
   var $or_cond8_not_i=$notrhs_i & $notlhs_i;
   var $878=(($876)>>>(0)) < (($877)>>>(0));
   var $or_cond9_i=$or_cond8_not_i & $878;
   if ($or_cond9_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $879=$877;
   var $880=$876;
   var $881=((($879)-($880))|0);
   var $882=((($nb_0)+(40))|0);
   var $883=(($881)>>>(0)) > (($882)>>>(0));
   var $_tsize_1_i=$883 ? $881 : $tsize_1_i;
   var $_tbase_1_i=$883 ? $876 : -1;
   var $884=(($_tbase_1_i)|(0))==-1;
   if ($884) { label = 340; break; } else { var $tsize_244_i = $_tsize_1_i;var $tbase_245_i = $_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_245_i;
   var $tsize_244_i;
   var $885=HEAP32[((((1504)|0))>>2)];
   var $886=((($885)+($tsize_244_i))|0);
   HEAP32[((((1504)|0))>>2)]=$886;
   var $887=HEAP32[((((1508)|0))>>2)];
   var $888=(($886)>>>(0)) > (($887)>>>(0));
   if ($888) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((1508)|0))>>2)]=$886;
   label = 203; break;
  case 203: 
   var $890=HEAP32[((((1096)|0))>>2)];
   var $891=(($890)|(0))==0;
   if ($891) { label = 204; break; } else { var $sp_067_i = ((1520)|0);label = 211; break; }
  case 204: 
   var $893=HEAP32[((((1088)|0))>>2)];
   var $894=(($893)|(0))==0;
   var $895=(($tbase_245_i)>>>(0)) < (($893)>>>(0));
   var $or_cond10_i=$894 | $895;
   if ($or_cond10_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((1088)|0))>>2)]=$tbase_245_i;
   label = 206; break;
  case 206: 
   HEAP32[((((1520)|0))>>2)]=$tbase_245_i;
   HEAP32[((((1524)|0))>>2)]=$tsize_244_i;
   HEAP32[((((1532)|0))>>2)]=0;
   var $897=HEAP32[((((1048)|0))>>2)];
   HEAP32[((((1108)|0))>>2)]=$897;
   HEAP32[((((1104)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $899=$i_02_i_i << 1;
   var $900=((1112+($899<<2))|0);
   var $901=$900;
   var $_sum_i_i=((($899)+(3))|0);
   var $902=((1112+($_sum_i_i<<2))|0);
   HEAP32[(($902)>>2)]=$901;
   var $_sum1_i_i=((($899)+(2))|0);
   var $903=((1112+($_sum1_i_i<<2))|0);
   HEAP32[(($903)>>2)]=$901;
   var $904=((($i_02_i_i)+(1))|0);
   var $905=(($904)>>>(0)) < 32;
   if ($905) { var $i_02_i_i = $904;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $906=((($tsize_244_i)-(40))|0);
   var $907=(($tbase_245_i+8)|0);
   var $908=$907;
   var $909=$908 & 7;
   var $910=(($909)|(0))==0;
   if ($910) { var $914 = 0;label = 210; break; } else { label = 209; break; }
  case 209: 
   var $912=(((-$908))|0);
   var $913=$912 & 7;
   var $914 = $913;label = 210; break;
  case 210: 
   var $914;
   var $915=(($tbase_245_i+$914)|0);
   var $916=$915;
   var $917=((($906)-($914))|0);
   HEAP32[((((1096)|0))>>2)]=$916;
   HEAP32[((((1084)|0))>>2)]=$917;
   var $918=$917 | 1;
   var $_sum_i14_i=((($914)+(4))|0);
   var $919=(($tbase_245_i+$_sum_i14_i)|0);
   var $920=$919;
   HEAP32[(($920)>>2)]=$918;
   var $_sum2_i_i=((($tsize_244_i)-(36))|0);
   var $921=(($tbase_245_i+$_sum2_i_i)|0);
   var $922=$921;
   HEAP32[(($922)>>2)]=40;
   var $923=HEAP32[((((1064)|0))>>2)];
   HEAP32[((((1100)|0))>>2)]=$923;
   label = 338; break;
  case 211: 
   var $sp_067_i;
   var $924=(($sp_067_i)|0);
   var $925=HEAP32[(($924)>>2)];
   var $926=(($sp_067_i+4)|0);
   var $927=HEAP32[(($926)>>2)];
   var $928=(($925+$927)|0);
   var $929=(($tbase_245_i)|(0))==(($928)|(0));
   if ($929) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $931=(($sp_067_i+8)|0);
   var $932=HEAP32[(($931)>>2)];
   var $933=(($932)|(0))==0;
   if ($933) { label = 218; break; } else { var $sp_067_i = $932;label = 211; break; }
  case 213: 
   var $934=(($sp_067_i+12)|0);
   var $935=HEAP32[(($934)>>2)];
   var $936=$935 & 8;
   var $937=(($936)|(0))==0;
   if ($937) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $939=$890;
   var $940=(($939)>>>(0)) >= (($925)>>>(0));
   var $941=(($939)>>>(0)) < (($tbase_245_i)>>>(0));
   var $or_cond47_i=$940 & $941;
   if ($or_cond47_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $943=((($927)+($tsize_244_i))|0);
   HEAP32[(($926)>>2)]=$943;
   var $944=HEAP32[((((1096)|0))>>2)];
   var $945=HEAP32[((((1084)|0))>>2)];
   var $946=((($945)+($tsize_244_i))|0);
   var $947=$944;
   var $948=(($944+8)|0);
   var $949=$948;
   var $950=$949 & 7;
   var $951=(($950)|(0))==0;
   if ($951) { var $955 = 0;label = 217; break; } else { label = 216; break; }
  case 216: 
   var $953=(((-$949))|0);
   var $954=$953 & 7;
   var $955 = $954;label = 217; break;
  case 217: 
   var $955;
   var $956=(($947+$955)|0);
   var $957=$956;
   var $958=((($946)-($955))|0);
   HEAP32[((((1096)|0))>>2)]=$957;
   HEAP32[((((1084)|0))>>2)]=$958;
   var $959=$958 | 1;
   var $_sum_i18_i=((($955)+(4))|0);
   var $960=(($947+$_sum_i18_i)|0);
   var $961=$960;
   HEAP32[(($961)>>2)]=$959;
   var $_sum2_i19_i=((($946)+(4))|0);
   var $962=(($947+$_sum2_i19_i)|0);
   var $963=$962;
   HEAP32[(($963)>>2)]=40;
   var $964=HEAP32[((((1064)|0))>>2)];
   HEAP32[((((1100)|0))>>2)]=$964;
   label = 338; break;
  case 218: 
   var $965=HEAP32[((((1088)|0))>>2)];
   var $966=(($tbase_245_i)>>>(0)) < (($965)>>>(0));
   if ($966) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((1088)|0))>>2)]=$tbase_245_i;
   label = 220; break;
  case 220: 
   var $968=(($tbase_245_i+$tsize_244_i)|0);
   var $sp_160_i = ((1520)|0);label = 221; break;
  case 221: 
   var $sp_160_i;
   var $970=(($sp_160_i)|0);
   var $971=HEAP32[(($970)>>2)];
   var $972=(($971)|(0))==(($968)|(0));
   if ($972) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $974=(($sp_160_i+8)|0);
   var $975=HEAP32[(($974)>>2)];
   var $976=(($975)|(0))==0;
   if ($976) { label = 304; break; } else { var $sp_160_i = $975;label = 221; break; }
  case 223: 
   var $977=(($sp_160_i+12)|0);
   var $978=HEAP32[(($977)>>2)];
   var $979=$978 & 8;
   var $980=(($979)|(0))==0;
   if ($980) { label = 224; break; } else { label = 304; break; }
  case 224: 
   HEAP32[(($970)>>2)]=$tbase_245_i;
   var $982=(($sp_160_i+4)|0);
   var $983=HEAP32[(($982)>>2)];
   var $984=((($983)+($tsize_244_i))|0);
   HEAP32[(($982)>>2)]=$984;
   var $985=(($tbase_245_i+8)|0);
   var $986=$985;
   var $987=$986 & 7;
   var $988=(($987)|(0))==0;
   if ($988) { var $993 = 0;label = 226; break; } else { label = 225; break; }
  case 225: 
   var $990=(((-$986))|0);
   var $991=$990 & 7;
   var $993 = $991;label = 226; break;
  case 226: 
   var $993;
   var $994=(($tbase_245_i+$993)|0);
   var $_sum93_i=((($tsize_244_i)+(8))|0);
   var $995=(($tbase_245_i+$_sum93_i)|0);
   var $996=$995;
   var $997=$996 & 7;
   var $998=(($997)|(0))==0;
   if ($998) { var $1003 = 0;label = 228; break; } else { label = 227; break; }
  case 227: 
   var $1000=(((-$996))|0);
   var $1001=$1000 & 7;
   var $1003 = $1001;label = 228; break;
  case 228: 
   var $1003;
   var $_sum94_i=((($1003)+($tsize_244_i))|0);
   var $1004=(($tbase_245_i+$_sum94_i)|0);
   var $1005=$1004;
   var $1006=$1004;
   var $1007=$994;
   var $1008=((($1006)-($1007))|0);
   var $_sum_i21_i=((($993)+($nb_0))|0);
   var $1009=(($tbase_245_i+$_sum_i21_i)|0);
   var $1010=$1009;
   var $1011=((($1008)-($nb_0))|0);
   var $1012=$nb_0 | 3;
   var $_sum1_i22_i=((($993)+(4))|0);
   var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
   var $1014=$1013;
   HEAP32[(($1014)>>2)]=$1012;
   var $1015=HEAP32[((((1096)|0))>>2)];
   var $1016=(($1005)|(0))==(($1015)|(0));
   if ($1016) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $1018=HEAP32[((((1084)|0))>>2)];
   var $1019=((($1018)+($1011))|0);
   HEAP32[((((1084)|0))>>2)]=$1019;
   HEAP32[((((1096)|0))>>2)]=$1010;
   var $1020=$1019 | 1;
   var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
   var $1021=(($tbase_245_i+$_sum46_i_i)|0);
   var $1022=$1021;
   HEAP32[(($1022)>>2)]=$1020;
   label = 303; break;
  case 230: 
   var $1024=HEAP32[((((1092)|0))>>2)];
   var $1025=(($1005)|(0))==(($1024)|(0));
   if ($1025) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $1027=HEAP32[((((1080)|0))>>2)];
   var $1028=((($1027)+($1011))|0);
   HEAP32[((((1080)|0))>>2)]=$1028;
   HEAP32[((((1092)|0))>>2)]=$1010;
   var $1029=$1028 | 1;
   var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
   var $1030=(($tbase_245_i+$_sum44_i_i)|0);
   var $1031=$1030;
   HEAP32[(($1031)>>2)]=$1029;
   var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
   var $1032=(($tbase_245_i+$_sum45_i_i)|0);
   var $1033=$1032;
   HEAP32[(($1033)>>2)]=$1028;
   label = 303; break;
  case 232: 
   var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
   var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
   var $1035=(($tbase_245_i+$_sum95_i)|0);
   var $1036=$1035;
   var $1037=HEAP32[(($1036)>>2)];
   var $1038=$1037 & 3;
   var $1039=(($1038)|(0))==1;
   if ($1039) { label = 233; break; } else { var $oldfirst_0_i_i = $1005;var $qsize_0_i_i = $1011;label = 280; break; }
  case 233: 
   var $1041=$1037 & -8;
   var $1042=$1037 >>> 3;
   var $1043=(($1037)>>>(0)) < 256;
   if ($1043) { label = 234; break; } else { label = 246; break; }
  case 234: 
   var $_sum3940_i_i=$1003 | 8;
   var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
   var $1045=(($tbase_245_i+$_sum105_i)|0);
   var $1046=$1045;
   var $1047=HEAP32[(($1046)>>2)];
   var $_sum41_i_i=((($tsize_244_i)+(12))|0);
   var $_sum106_i=((($_sum41_i_i)+($1003))|0);
   var $1048=(($tbase_245_i+$_sum106_i)|0);
   var $1049=$1048;
   var $1050=HEAP32[(($1049)>>2)];
   var $1051=$1042 << 1;
   var $1052=((1112+($1051<<2))|0);
   var $1053=$1052;
   var $1054=(($1047)|(0))==(($1053)|(0));
   if ($1054) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $1056=$1047;
   var $1057=HEAP32[((((1088)|0))>>2)];
   var $1058=(($1056)>>>(0)) < (($1057)>>>(0));
   if ($1058) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $1060=(($1047+12)|0);
   var $1061=HEAP32[(($1060)>>2)];
   var $1062=(($1061)|(0))==(($1005)|(0));
   if ($1062) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $1063=(($1050)|(0))==(($1047)|(0));
   if ($1063) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $1065=1 << $1042;
   var $1066=$1065 ^ -1;
   var $1067=HEAP32[((((1072)|0))>>2)];
   var $1068=$1067 & $1066;
   HEAP32[((((1072)|0))>>2)]=$1068;
   label = 279; break;
  case 239: 
   var $1070=(($1050)|(0))==(($1053)|(0));
   if ($1070) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $_pre56_i_i=(($1050+8)|0);
   var $_pre_phi57_i_i = $_pre56_i_i;label = 243; break;
  case 241: 
   var $1072=$1050;
   var $1073=HEAP32[((((1088)|0))>>2)];
   var $1074=(($1072)>>>(0)) < (($1073)>>>(0));
   if ($1074) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $1076=(($1050+8)|0);
   var $1077=HEAP32[(($1076)>>2)];
   var $1078=(($1077)|(0))==(($1005)|(0));
   if ($1078) { var $_pre_phi57_i_i = $1076;label = 243; break; } else { label = 244; break; }
  case 243: 
   var $_pre_phi57_i_i;
   var $1079=(($1047+12)|0);
   HEAP32[(($1079)>>2)]=$1050;
   HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
   label = 279; break;
  case 244: 
   _abort();
   throw "Reached an unreachable!";
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   var $1081=$1004;
   var $_sum34_i_i=$1003 | 24;
   var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
   var $1082=(($tbase_245_i+$_sum96_i)|0);
   var $1083=$1082;
   var $1084=HEAP32[(($1083)>>2)];
   var $_sum5_i_i=((($tsize_244_i)+(12))|0);
   var $_sum97_i=((($_sum5_i_i)+($1003))|0);
   var $1085=(($tbase_245_i+$_sum97_i)|0);
   var $1086=$1085;
   var $1087=HEAP32[(($1086)>>2)];
   var $1088=(($1087)|(0))==(($1081)|(0));
   if ($1088) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $_sum3637_i_i=$1003 | 8;
   var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
   var $1090=(($tbase_245_i+$_sum98_i)|0);
   var $1091=$1090;
   var $1092=HEAP32[(($1091)>>2)];
   var $1093=$1092;
   var $1094=HEAP32[((((1088)|0))>>2)];
   var $1095=(($1093)>>>(0)) < (($1094)>>>(0));
   if ($1095) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $1097=(($1092+12)|0);
   var $1098=HEAP32[(($1097)>>2)];
   var $1099=(($1098)|(0))==(($1081)|(0));
   if ($1099) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $1101=(($1087+8)|0);
   var $1102=HEAP32[(($1101)>>2)];
   var $1103=(($1102)|(0))==(($1081)|(0));
   if ($1103) { label = 250; break; } else { label = 251; break; }
  case 250: 
   HEAP32[(($1097)>>2)]=$1087;
   HEAP32[(($1101)>>2)]=$1092;
   var $R_1_i_i = $1087;label = 259; break;
  case 251: 
   _abort();
   throw "Reached an unreachable!";
  case 252: 
   var $_sum67_i_i=$1003 | 16;
   var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
   var $1106=(($tbase_245_i+$_sum103_i)|0);
   var $1107=$1106;
   var $1108=HEAP32[(($1107)>>2)];
   var $1109=(($1108)|(0))==0;
   if ($1109) { label = 253; break; } else { var $R_0_i_i = $1108;var $RP_0_i_i = $1107;label = 254; break; }
  case 253: 
   var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
   var $1111=(($tbase_245_i+$_sum104_i)|0);
   var $1112=$1111;
   var $1113=HEAP32[(($1112)>>2)];
   var $1114=(($1113)|(0))==0;
   if ($1114) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $1113;var $RP_0_i_i = $1112;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $1115=(($R_0_i_i+20)|0);
   var $1116=HEAP32[(($1115)>>2)];
   var $1117=(($1116)|(0))==0;
   if ($1117) { label = 255; break; } else { var $R_0_i_i = $1116;var $RP_0_i_i = $1115;label = 254; break; }
  case 255: 
   var $1119=(($R_0_i_i+16)|0);
   var $1120=HEAP32[(($1119)>>2)];
   var $1121=(($1120)|(0))==0;
   if ($1121) { label = 256; break; } else { var $R_0_i_i = $1120;var $RP_0_i_i = $1119;label = 254; break; }
  case 256: 
   var $1123=$RP_0_i_i;
   var $1124=HEAP32[((((1088)|0))>>2)];
   var $1125=(($1123)>>>(0)) < (($1124)>>>(0));
   if ($1125) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $1129=(($1084)|(0))==0;
   if ($1129) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $_sum31_i_i=((($tsize_244_i)+(28))|0);
   var $_sum99_i=((($_sum31_i_i)+($1003))|0);
   var $1131=(($tbase_245_i+$_sum99_i)|0);
   var $1132=$1131;
   var $1133=HEAP32[(($1132)>>2)];
   var $1134=((1376+($1133<<2))|0);
   var $1135=HEAP32[(($1134)>>2)];
   var $1136=(($1081)|(0))==(($1135)|(0));
   if ($1136) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($1134)>>2)]=$R_1_i_i;
   var $cond_i_i=(($R_1_i_i)|(0))==0;
   if ($cond_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $1138=HEAP32[(($1132)>>2)];
   var $1139=1 << $1138;
   var $1140=$1139 ^ -1;
   var $1141=HEAP32[((((1076)|0))>>2)];
   var $1142=$1141 & $1140;
   HEAP32[((((1076)|0))>>2)]=$1142;
   label = 279; break;
  case 263: 
   var $1144=$1084;
   var $1145=HEAP32[((((1088)|0))>>2)];
   var $1146=(($1144)>>>(0)) < (($1145)>>>(0));
   if ($1146) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $1148=(($1084+16)|0);
   var $1149=HEAP32[(($1148)>>2)];
   var $1150=(($1149)|(0))==(($1081)|(0));
   if ($1150) { label = 265; break; } else { label = 266; break; }
  case 265: 
   HEAP32[(($1148)>>2)]=$R_1_i_i;
   label = 268; break;
  case 266: 
   var $1153=(($1084+20)|0);
   HEAP32[(($1153)>>2)]=$R_1_i_i;
   label = 268; break;
  case 267: 
   _abort();
   throw "Reached an unreachable!";
  case 268: 
   var $1156=(($R_1_i_i)|(0))==0;
   if ($1156) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $1158=$R_1_i_i;
   var $1159=HEAP32[((((1088)|0))>>2)];
   var $1160=(($1158)>>>(0)) < (($1159)>>>(0));
   if ($1160) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $1162=(($R_1_i_i+24)|0);
   HEAP32[(($1162)>>2)]=$1084;
   var $_sum3233_i_i=$1003 | 16;
   var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
   var $1163=(($tbase_245_i+$_sum100_i)|0);
   var $1164=$1163;
   var $1165=HEAP32[(($1164)>>2)];
   var $1166=(($1165)|(0))==0;
   if ($1166) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $1168=$1165;
   var $1169=HEAP32[((((1088)|0))>>2)];
   var $1170=(($1168)>>>(0)) < (($1169)>>>(0));
   if ($1170) { label = 273; break; } else { label = 272; break; }
  case 272: 
   var $1172=(($R_1_i_i+16)|0);
   HEAP32[(($1172)>>2)]=$1165;
   var $1173=(($1165+24)|0);
   HEAP32[(($1173)>>2)]=$R_1_i_i;
   label = 274; break;
  case 273: 
   _abort();
   throw "Reached an unreachable!";
  case 274: 
   var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
   var $1176=(($tbase_245_i+$_sum101_i)|0);
   var $1177=$1176;
   var $1178=HEAP32[(($1177)>>2)];
   var $1179=(($1178)|(0))==0;
   if ($1179) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $1181=$1178;
   var $1182=HEAP32[((((1088)|0))>>2)];
   var $1183=(($1181)>>>(0)) < (($1182)>>>(0));
   if ($1183) { label = 277; break; } else { label = 276; break; }
  case 276: 
   var $1185=(($R_1_i_i+20)|0);
   HEAP32[(($1185)>>2)]=$1178;
   var $1186=(($1178+24)|0);
   HEAP32[(($1186)>>2)]=$R_1_i_i;
   label = 279; break;
  case 277: 
   _abort();
   throw "Reached an unreachable!";
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   var $_sum9_i_i=$1041 | $1003;
   var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
   var $1190=(($tbase_245_i+$_sum102_i)|0);
   var $1191=$1190;
   var $1192=((($1041)+($1011))|0);
   var $oldfirst_0_i_i = $1191;var $qsize_0_i_i = $1192;label = 280; break;
  case 280: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $1194=(($oldfirst_0_i_i+4)|0);
   var $1195=HEAP32[(($1194)>>2)];
   var $1196=$1195 & -2;
   HEAP32[(($1194)>>2)]=$1196;
   var $1197=$qsize_0_i_i | 1;
   var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
   var $1198=(($tbase_245_i+$_sum10_i_i)|0);
   var $1199=$1198;
   HEAP32[(($1199)>>2)]=$1197;
   var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
   var $1200=(($tbase_245_i+$_sum11_i_i)|0);
   var $1201=$1200;
   HEAP32[(($1201)>>2)]=$qsize_0_i_i;
   var $1202=$qsize_0_i_i >>> 3;
   var $1203=(($qsize_0_i_i)>>>(0)) < 256;
   if ($1203) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $1205=$1202 << 1;
   var $1206=((1112+($1205<<2))|0);
   var $1207=$1206;
   var $1208=HEAP32[((((1072)|0))>>2)];
   var $1209=1 << $1202;
   var $1210=$1208 & $1209;
   var $1211=(($1210)|(0))==0;
   if ($1211) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $1213=$1208 | $1209;
   HEAP32[((((1072)|0))>>2)]=$1213;
   var $_sum27_pre_i_i=((($1205)+(2))|0);
   var $_pre_i24_i=((1112+($_sum27_pre_i_i<<2))|0);
   var $F4_0_i_i = $1207;var $_pre_phi_i25_i = $_pre_i24_i;label = 285; break;
  case 283: 
   var $_sum30_i_i=((($1205)+(2))|0);
   var $1215=((1112+($_sum30_i_i<<2))|0);
   var $1216=HEAP32[(($1215)>>2)];
   var $1217=$1216;
   var $1218=HEAP32[((((1088)|0))>>2)];
   var $1219=(($1217)>>>(0)) < (($1218)>>>(0));
   if ($1219) { label = 284; break; } else { var $F4_0_i_i = $1216;var $_pre_phi_i25_i = $1215;label = 285; break; }
  case 284: 
   _abort();
   throw "Reached an unreachable!";
  case 285: 
   var $_pre_phi_i25_i;
   var $F4_0_i_i;
   HEAP32[(($_pre_phi_i25_i)>>2)]=$1010;
   var $1222=(($F4_0_i_i+12)|0);
   HEAP32[(($1222)>>2)]=$1010;
   var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
   var $1223=(($tbase_245_i+$_sum28_i_i)|0);
   var $1224=$1223;
   HEAP32[(($1224)>>2)]=$F4_0_i_i;
   var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
   var $1225=(($tbase_245_i+$_sum29_i_i)|0);
   var $1226=$1225;
   HEAP32[(($1226)>>2)]=$1207;
   label = 303; break;
  case 286: 
   var $1228=$1009;
   var $1229=$qsize_0_i_i >>> 8;
   var $1230=(($1229)|(0))==0;
   if ($1230) { var $I7_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $1232=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($1232) { var $I7_0_i_i = 31;label = 289; break; } else { label = 288; break; }
  case 288: 
   var $1234=((($1229)+(1048320))|0);
   var $1235=$1234 >>> 16;
   var $1236=$1235 & 8;
   var $1237=$1229 << $1236;
   var $1238=((($1237)+(520192))|0);
   var $1239=$1238 >>> 16;
   var $1240=$1239 & 4;
   var $1241=$1240 | $1236;
   var $1242=$1237 << $1240;
   var $1243=((($1242)+(245760))|0);
   var $1244=$1243 >>> 16;
   var $1245=$1244 & 2;
   var $1246=$1241 | $1245;
   var $1247=(((14)-($1246))|0);
   var $1248=$1242 << $1245;
   var $1249=$1248 >>> 15;
   var $1250=((($1247)+($1249))|0);
   var $1251=$1250 << 1;
   var $1252=((($1250)+(7))|0);
   var $1253=$qsize_0_i_i >>> (($1252)>>>(0));
   var $1254=$1253 & 1;
   var $1255=$1254 | $1251;
   var $I7_0_i_i = $1255;label = 289; break;
  case 289: 
   var $I7_0_i_i;
   var $1257=((1376+($I7_0_i_i<<2))|0);
   var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
   var $1258=(($tbase_245_i+$_sum12_i26_i)|0);
   var $1259=$1258;
   HEAP32[(($1259)>>2)]=$I7_0_i_i;
   var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
   var $1260=(($tbase_245_i+$_sum13_i_i)|0);
   var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
   var $1261=(($tbase_245_i+$_sum14_i_i)|0);
   var $1262=$1261;
   HEAP32[(($1262)>>2)]=0;
   var $1263=$1260;
   HEAP32[(($1263)>>2)]=0;
   var $1264=HEAP32[((((1076)|0))>>2)];
   var $1265=1 << $I7_0_i_i;
   var $1266=$1264 & $1265;
   var $1267=(($1266)|(0))==0;
   if ($1267) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $1269=$1264 | $1265;
   HEAP32[((((1076)|0))>>2)]=$1269;
   HEAP32[(($1257)>>2)]=$1228;
   var $1270=$1257;
   var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
   var $1271=(($tbase_245_i+$_sum15_i_i)|0);
   var $1272=$1271;
   HEAP32[(($1272)>>2)]=$1270;
   var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
   var $1273=(($tbase_245_i+$_sum16_i_i)|0);
   var $1274=$1273;
   HEAP32[(($1274)>>2)]=$1228;
   var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
   var $1275=(($tbase_245_i+$_sum17_i_i)|0);
   var $1276=$1275;
   HEAP32[(($1276)>>2)]=$1228;
   label = 303; break;
  case 291: 
   var $1278=HEAP32[(($1257)>>2)];
   var $1279=(($I7_0_i_i)|(0))==31;
   if ($1279) { var $1284 = 0;label = 293; break; } else { label = 292; break; }
  case 292: 
   var $1281=$I7_0_i_i >>> 1;
   var $1282=(((25)-($1281))|0);
   var $1284 = $1282;label = 293; break;
  case 293: 
   var $1284;
   var $1285=$qsize_0_i_i << $1284;
   var $K8_0_i_i = $1285;var $T_0_i27_i = $1278;label = 294; break;
  case 294: 
   var $T_0_i27_i;
   var $K8_0_i_i;
   var $1287=(($T_0_i27_i+4)|0);
   var $1288=HEAP32[(($1287)>>2)];
   var $1289=$1288 & -8;
   var $1290=(($1289)|(0))==(($qsize_0_i_i)|(0));
   if ($1290) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $1292=$K8_0_i_i >>> 31;
   var $1293=(($T_0_i27_i+16+($1292<<2))|0);
   var $1294=HEAP32[(($1293)>>2)];
   var $1295=(($1294)|(0))==0;
   var $1296=$K8_0_i_i << 1;
   if ($1295) { label = 296; break; } else { var $K8_0_i_i = $1296;var $T_0_i27_i = $1294;label = 294; break; }
  case 296: 
   var $1298=$1293;
   var $1299=HEAP32[((((1088)|0))>>2)];
   var $1300=(($1298)>>>(0)) < (($1299)>>>(0));
   if ($1300) { label = 298; break; } else { label = 297; break; }
  case 297: 
   HEAP32[(($1293)>>2)]=$1228;
   var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
   var $1302=(($tbase_245_i+$_sum24_i_i)|0);
   var $1303=$1302;
   HEAP32[(($1303)>>2)]=$T_0_i27_i;
   var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
   var $1304=(($tbase_245_i+$_sum25_i_i)|0);
   var $1305=$1304;
   HEAP32[(($1305)>>2)]=$1228;
   var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
   var $1306=(($tbase_245_i+$_sum26_i_i)|0);
   var $1307=$1306;
   HEAP32[(($1307)>>2)]=$1228;
   label = 303; break;
  case 298: 
   _abort();
   throw "Reached an unreachable!";
  case 299: 
   var $1310=(($T_0_i27_i+8)|0);
   var $1311=HEAP32[(($1310)>>2)];
   var $1312=$T_0_i27_i;
   var $1313=HEAP32[((((1088)|0))>>2)];
   var $1314=(($1312)>>>(0)) < (($1313)>>>(0));
   if ($1314) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $1316=$1311;
   var $1317=(($1316)>>>(0)) < (($1313)>>>(0));
   if ($1317) { label = 302; break; } else { label = 301; break; }
  case 301: 
   var $1319=(($1311+12)|0);
   HEAP32[(($1319)>>2)]=$1228;
   HEAP32[(($1310)>>2)]=$1228;
   var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
   var $1320=(($tbase_245_i+$_sum21_i_i)|0);
   var $1321=$1320;
   HEAP32[(($1321)>>2)]=$1311;
   var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
   var $1322=(($tbase_245_i+$_sum22_i_i)|0);
   var $1323=$1322;
   HEAP32[(($1323)>>2)]=$T_0_i27_i;
   var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
   var $1324=(($tbase_245_i+$_sum23_i_i)|0);
   var $1325=$1324;
   HEAP32[(($1325)>>2)]=0;
   label = 303; break;
  case 302: 
   _abort();
   throw "Reached an unreachable!";
  case 303: 
   var $_sum1819_i_i=$993 | 8;
   var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
   var $mem_0 = $1326;label = 341; break;
  case 304: 
   var $1327=$890;
   var $sp_0_i_i_i = ((1520)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $1329=(($sp_0_i_i_i)|0);
   var $1330=HEAP32[(($1329)>>2)];
   var $1331=(($1330)>>>(0)) > (($1327)>>>(0));
   if ($1331) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $1333=(($sp_0_i_i_i+4)|0);
   var $1334=HEAP32[(($1333)>>2)];
   var $1335=(($1330+$1334)|0);
   var $1336=(($1335)>>>(0)) > (($1327)>>>(0));
   if ($1336) { label = 308; break; } else { label = 307; break; }
  case 307: 
   var $1338=(($sp_0_i_i_i+8)|0);
   var $1339=HEAP32[(($1338)>>2)];
   var $sp_0_i_i_i = $1339;label = 305; break;
  case 308: 
   var $_sum_i15_i=((($1334)-(47))|0);
   var $_sum1_i16_i=((($1334)-(39))|0);
   var $1340=(($1330+$_sum1_i16_i)|0);
   var $1341=$1340;
   var $1342=$1341 & 7;
   var $1343=(($1342)|(0))==0;
   if ($1343) { var $1348 = 0;label = 310; break; } else { label = 309; break; }
  case 309: 
   var $1345=(((-$1341))|0);
   var $1346=$1345 & 7;
   var $1348 = $1346;label = 310; break;
  case 310: 
   var $1348;
   var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
   var $1349=(($1330+$_sum2_i17_i)|0);
   var $1350=(($890+16)|0);
   var $1351=$1350;
   var $1352=(($1349)>>>(0)) < (($1351)>>>(0));
   var $1353=$1352 ? $1327 : $1349;
   var $1354=(($1353+8)|0);
   var $1355=$1354;
   var $1356=((($tsize_244_i)-(40))|0);
   var $1357=(($tbase_245_i+8)|0);
   var $1358=$1357;
   var $1359=$1358 & 7;
   var $1360=(($1359)|(0))==0;
   if ($1360) { var $1364 = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $1362=(((-$1358))|0);
   var $1363=$1362 & 7;
   var $1364 = $1363;label = 312; break;
  case 312: 
   var $1364;
   var $1365=(($tbase_245_i+$1364)|0);
   var $1366=$1365;
   var $1367=((($1356)-($1364))|0);
   HEAP32[((((1096)|0))>>2)]=$1366;
   HEAP32[((((1084)|0))>>2)]=$1367;
   var $1368=$1367 | 1;
   var $_sum_i_i_i=((($1364)+(4))|0);
   var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
   var $1370=$1369;
   HEAP32[(($1370)>>2)]=$1368;
   var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
   var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
   var $1372=$1371;
   HEAP32[(($1372)>>2)]=40;
   var $1373=HEAP32[((((1064)|0))>>2)];
   HEAP32[((((1100)|0))>>2)]=$1373;
   var $1374=(($1353+4)|0);
   var $1375=$1374;
   HEAP32[(($1375)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[(((((1520)|0)))>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((((((1520)|0)))+(4))>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((((((1520)|0)))+(8))>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((((((1520)|0)))+(12))>>2)];
   HEAP32[((((1520)|0))>>2)]=$tbase_245_i;
   HEAP32[((((1524)|0))>>2)]=$tsize_244_i;
   HEAP32[((((1532)|0))>>2)]=0;
   HEAP32[((((1528)|0))>>2)]=$1355;
   var $1376=(($1353+28)|0);
   var $1377=$1376;
   HEAP32[(($1377)>>2)]=7;
   var $1378=(($1353+32)|0);
   var $1379=(($1378)>>>(0)) < (($1335)>>>(0));
   if ($1379) { var $1380 = $1377;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $1380;
   var $1381=(($1380+4)|0);
   HEAP32[(($1381)>>2)]=7;
   var $1382=(($1380+8)|0);
   var $1383=$1382;
   var $1384=(($1383)>>>(0)) < (($1335)>>>(0));
   if ($1384) { var $1380 = $1381;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $1385=(($1353)|(0))==(($1327)|(0));
   if ($1385) { label = 338; break; } else { label = 315; break; }
  case 315: 
   var $1387=$1353;
   var $1388=$890;
   var $1389=((($1387)-($1388))|0);
   var $1390=(($1327+$1389)|0);
   var $_sum3_i_i=((($1389)+(4))|0);
   var $1391=(($1327+$_sum3_i_i)|0);
   var $1392=$1391;
   var $1393=HEAP32[(($1392)>>2)];
   var $1394=$1393 & -2;
   HEAP32[(($1392)>>2)]=$1394;
   var $1395=$1389 | 1;
   var $1396=(($890+4)|0);
   HEAP32[(($1396)>>2)]=$1395;
   var $1397=$1390;
   HEAP32[(($1397)>>2)]=$1389;
   var $1398=$1389 >>> 3;
   var $1399=(($1389)>>>(0)) < 256;
   if ($1399) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $1401=$1398 << 1;
   var $1402=((1112+($1401<<2))|0);
   var $1403=$1402;
   var $1404=HEAP32[((((1072)|0))>>2)];
   var $1405=1 << $1398;
   var $1406=$1404 & $1405;
   var $1407=(($1406)|(0))==0;
   if ($1407) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $1409=$1404 | $1405;
   HEAP32[((((1072)|0))>>2)]=$1409;
   var $_sum11_pre_i_i=((($1401)+(2))|0);
   var $_pre_i_i=((1112+($_sum11_pre_i_i<<2))|0);
   var $F_0_i_i = $1403;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $_sum12_i_i=((($1401)+(2))|0);
   var $1411=((1112+($_sum12_i_i<<2))|0);
   var $1412=HEAP32[(($1411)>>2)];
   var $1413=$1412;
   var $1414=HEAP32[((((1088)|0))>>2)];
   var $1415=(($1413)>>>(0)) < (($1414)>>>(0));
   if ($1415) { label = 319; break; } else { var $F_0_i_i = $1412;var $_pre_phi_i_i = $1411;label = 320; break; }
  case 319: 
   _abort();
   throw "Reached an unreachable!";
  case 320: 
   var $_pre_phi_i_i;
   var $F_0_i_i;
   HEAP32[(($_pre_phi_i_i)>>2)]=$890;
   var $1418=(($F_0_i_i+12)|0);
   HEAP32[(($1418)>>2)]=$890;
   var $1419=(($890+8)|0);
   HEAP32[(($1419)>>2)]=$F_0_i_i;
   var $1420=(($890+12)|0);
   HEAP32[(($1420)>>2)]=$1403;
   label = 338; break;
  case 321: 
   var $1422=$890;
   var $1423=$1389 >>> 8;
   var $1424=(($1423)|(0))==0;
   if ($1424) { var $I1_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $1426=(($1389)>>>(0)) > 16777215;
   if ($1426) { var $I1_0_i_i = 31;label = 324; break; } else { label = 323; break; }
  case 323: 
   var $1428=((($1423)+(1048320))|0);
   var $1429=$1428 >>> 16;
   var $1430=$1429 & 8;
   var $1431=$1423 << $1430;
   var $1432=((($1431)+(520192))|0);
   var $1433=$1432 >>> 16;
   var $1434=$1433 & 4;
   var $1435=$1434 | $1430;
   var $1436=$1431 << $1434;
   var $1437=((($1436)+(245760))|0);
   var $1438=$1437 >>> 16;
   var $1439=$1438 & 2;
   var $1440=$1435 | $1439;
   var $1441=(((14)-($1440))|0);
   var $1442=$1436 << $1439;
   var $1443=$1442 >>> 15;
   var $1444=((($1441)+($1443))|0);
   var $1445=$1444 << 1;
   var $1446=((($1444)+(7))|0);
   var $1447=$1389 >>> (($1446)>>>(0));
   var $1448=$1447 & 1;
   var $1449=$1448 | $1445;
   var $I1_0_i_i = $1449;label = 324; break;
  case 324: 
   var $I1_0_i_i;
   var $1451=((1376+($I1_0_i_i<<2))|0);
   var $1452=(($890+28)|0);
   var $I1_0_c_i_i=$I1_0_i_i;
   HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
   var $1453=(($890+20)|0);
   HEAP32[(($1453)>>2)]=0;
   var $1454=(($890+16)|0);
   HEAP32[(($1454)>>2)]=0;
   var $1455=HEAP32[((((1076)|0))>>2)];
   var $1456=1 << $I1_0_i_i;
   var $1457=$1455 & $1456;
   var $1458=(($1457)|(0))==0;
   if ($1458) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $1460=$1455 | $1456;
   HEAP32[((((1076)|0))>>2)]=$1460;
   HEAP32[(($1451)>>2)]=$1422;
   var $1461=(($890+24)|0);
   var $_c_i_i=$1451;
   HEAP32[(($1461)>>2)]=$_c_i_i;
   var $1462=(($890+12)|0);
   HEAP32[(($1462)>>2)]=$890;
   var $1463=(($890+8)|0);
   HEAP32[(($1463)>>2)]=$890;
   label = 338; break;
  case 326: 
   var $1465=HEAP32[(($1451)>>2)];
   var $1466=(($I1_0_i_i)|(0))==31;
   if ($1466) { var $1471 = 0;label = 328; break; } else { label = 327; break; }
  case 327: 
   var $1468=$I1_0_i_i >>> 1;
   var $1469=(((25)-($1468))|0);
   var $1471 = $1469;label = 328; break;
  case 328: 
   var $1471;
   var $1472=$1389 << $1471;
   var $K2_0_i_i = $1472;var $T_0_i_i = $1465;label = 329; break;
  case 329: 
   var $T_0_i_i;
   var $K2_0_i_i;
   var $1474=(($T_0_i_i+4)|0);
   var $1475=HEAP32[(($1474)>>2)];
   var $1476=$1475 & -8;
   var $1477=(($1476)|(0))==(($1389)|(0));
   if ($1477) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $1479=$K2_0_i_i >>> 31;
   var $1480=(($T_0_i_i+16+($1479<<2))|0);
   var $1481=HEAP32[(($1480)>>2)];
   var $1482=(($1481)|(0))==0;
   var $1483=$K2_0_i_i << 1;
   if ($1482) { label = 331; break; } else { var $K2_0_i_i = $1483;var $T_0_i_i = $1481;label = 329; break; }
  case 331: 
   var $1485=$1480;
   var $1486=HEAP32[((((1088)|0))>>2)];
   var $1487=(($1485)>>>(0)) < (($1486)>>>(0));
   if ($1487) { label = 333; break; } else { label = 332; break; }
  case 332: 
   HEAP32[(($1480)>>2)]=$1422;
   var $1489=(($890+24)|0);
   var $T_0_c8_i_i=$T_0_i_i;
   HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
   var $1490=(($890+12)|0);
   HEAP32[(($1490)>>2)]=$890;
   var $1491=(($890+8)|0);
   HEAP32[(($1491)>>2)]=$890;
   label = 338; break;
  case 333: 
   _abort();
   throw "Reached an unreachable!";
  case 334: 
   var $1494=(($T_0_i_i+8)|0);
   var $1495=HEAP32[(($1494)>>2)];
   var $1496=$T_0_i_i;
   var $1497=HEAP32[((((1088)|0))>>2)];
   var $1498=(($1496)>>>(0)) < (($1497)>>>(0));
   if ($1498) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $1500=$1495;
   var $1501=(($1500)>>>(0)) < (($1497)>>>(0));
   if ($1501) { label = 337; break; } else { label = 336; break; }
  case 336: 
   var $1503=(($1495+12)|0);
   HEAP32[(($1503)>>2)]=$1422;
   HEAP32[(($1494)>>2)]=$1422;
   var $1504=(($890+8)|0);
   var $_c7_i_i=$1495;
   HEAP32[(($1504)>>2)]=$_c7_i_i;
   var $1505=(($890+12)|0);
   var $T_0_c_i_i=$T_0_i_i;
   HEAP32[(($1505)>>2)]=$T_0_c_i_i;
   var $1506=(($890+24)|0);
   HEAP32[(($1506)>>2)]=0;
   label = 338; break;
  case 337: 
   _abort();
   throw "Reached an unreachable!";
  case 338: 
   var $1507=HEAP32[((((1084)|0))>>2)];
   var $1508=(($1507)>>>(0)) > (($nb_0)>>>(0));
   if ($1508) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $1510=((($1507)-($nb_0))|0);
   HEAP32[((((1084)|0))>>2)]=$1510;
   var $1511=HEAP32[((((1096)|0))>>2)];
   var $1512=$1511;
   var $1513=(($1512+$nb_0)|0);
   var $1514=$1513;
   HEAP32[((((1096)|0))>>2)]=$1514;
   var $1515=$1510 | 1;
   var $_sum_i134=((($nb_0)+(4))|0);
   var $1516=(($1512+$_sum_i134)|0);
   var $1517=$1516;
   HEAP32[(($1517)>>2)]=$1515;
   var $1518=$nb_0 | 3;
   var $1519=(($1511+4)|0);
   HEAP32[(($1519)>>2)]=$1518;
   var $1520=(($1511+8)|0);
   var $1521=$1520;
   var $mem_0 = $1521;label = 341; break;
  case 340: 
   var $1522=___errno_location();
   HEAP32[(($1522)>>2)]=12;
   var $mem_0 = 0;label = 341; break;
  case 341: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($mem)|(0))==0;
   if ($1) { label = 160; break; } else { label = 2; break; }
  case 2: 
   var $3=((($mem)-(8))|0);
   var $4=$3;
   var $5=HEAP32[((((1088)|0))>>2)];
   var $6=(($3)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 159; break; } else { label = 3; break; }
  case 3: 
   var $8=((($mem)-(4))|0);
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10 & 3;
   var $12=(($11)|(0))==1;
   if ($12) { label = 159; break; } else { label = 4; break; }
  case 4: 
   var $14=$10 & -8;
   var $_sum=((($14)-(8))|0);
   var $15=(($mem+$_sum)|0);
   var $16=$15;
   var $17=$10 & 1;
   var $18=(($17)|(0))==0;
   if ($18) { label = 5; break; } else { var $p_0 = $4;var $psize_0 = $14;label = 56; break; }
  case 5: 
   var $20=$3;
   var $21=HEAP32[(($20)>>2)];
   var $22=(($11)|(0))==0;
   if ($22) { label = 160; break; } else { label = 6; break; }
  case 6: 
   var $_sum233=(((-8)-($21))|0);
   var $24=(($mem+$_sum233)|0);
   var $25=$24;
   var $26=((($21)+($14))|0);
   var $27=(($24)>>>(0)) < (($5)>>>(0));
   if ($27) { label = 159; break; } else { label = 7; break; }
  case 7: 
   var $29=HEAP32[((((1092)|0))>>2)];
   var $30=(($25)|(0))==(($29)|(0));
   if ($30) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $32=$21 >>> 3;
   var $33=(($21)>>>(0)) < 256;
   if ($33) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $_sum277=((($_sum233)+(8))|0);
   var $35=(($mem+$_sum277)|0);
   var $36=$35;
   var $37=HEAP32[(($36)>>2)];
   var $_sum278=((($_sum233)+(12))|0);
   var $38=(($mem+$_sum278)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $41=$32 << 1;
   var $42=((1112+($41<<2))|0);
   var $43=$42;
   var $44=(($37)|(0))==(($43)|(0));
   if ($44) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $46=$37;
   var $47=(($46)>>>(0)) < (($5)>>>(0));
   if ($47) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $49=(($37+12)|0);
   var $50=HEAP32[(($49)>>2)];
   var $51=(($50)|(0))==(($25)|(0));
   if ($51) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $52=(($40)|(0))==(($37)|(0));
   if ($52) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $54=1 << $32;
   var $55=$54 ^ -1;
   var $56=HEAP32[((((1072)|0))>>2)];
   var $57=$56 & $55;
   HEAP32[((((1072)|0))>>2)]=$57;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 14: 
   var $59=(($40)|(0))==(($43)|(0));
   if ($59) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre306=(($40+8)|0);
   var $_pre_phi307 = $_pre306;label = 18; break;
  case 16: 
   var $61=$40;
   var $62=(($61)>>>(0)) < (($5)>>>(0));
   if ($62) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $64=(($40+8)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==(($25)|(0));
   if ($66) { var $_pre_phi307 = $64;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $_pre_phi307;
   var $67=(($37+12)|0);
   HEAP32[(($67)>>2)]=$40;
   HEAP32[(($_pre_phi307)>>2)]=$37;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $69=$24;
   var $_sum267=((($_sum233)+(24))|0);
   var $70=(($mem+$_sum267)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $_sum268=((($_sum233)+(12))|0);
   var $73=(($mem+$_sum268)|0);
   var $74=$73;
   var $75=HEAP32[(($74)>>2)];
   var $76=(($75)|(0))==(($69)|(0));
   if ($76) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $_sum274=((($_sum233)+(8))|0);
   var $78=(($mem+$_sum274)|0);
   var $79=$78;
   var $80=HEAP32[(($79)>>2)];
   var $81=$80;
   var $82=(($81)>>>(0)) < (($5)>>>(0));
   if ($82) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $84=(($80+12)|0);
   var $85=HEAP32[(($84)>>2)];
   var $86=(($85)|(0))==(($69)|(0));
   if ($86) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $88=(($75+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($89)|(0))==(($69)|(0));
   if ($90) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($84)>>2)]=$75;
   HEAP32[(($88)>>2)]=$80;
   var $R_1 = $75;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $_sum270=((($_sum233)+(20))|0);
   var $93=(($mem+$_sum270)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 28; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 29; break; }
  case 28: 
   var $_sum269=((($_sum233)+(16))|0);
   var $98=(($mem+$_sum269)|0);
   var $99=$98;
   var $100=HEAP32[(($99)>>2)];
   var $101=(($100)|(0))==0;
   if ($101) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $100;var $RP_0 = $99;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $102=(($R_0+20)|0);
   var $103=HEAP32[(($102)>>2)];
   var $104=(($103)|(0))==0;
   if ($104) { label = 30; break; } else { var $R_0 = $103;var $RP_0 = $102;label = 29; break; }
  case 30: 
   var $106=(($R_0+16)|0);
   var $107=HEAP32[(($106)>>2)];
   var $108=(($107)|(0))==0;
   if ($108) { label = 31; break; } else { var $R_0 = $107;var $RP_0 = $106;label = 29; break; }
  case 31: 
   var $110=$RP_0;
   var $111=(($110)>>>(0)) < (($5)>>>(0));
   if ($111) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $115=(($72)|(0))==0;
   if ($115) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $_sum271=((($_sum233)+(28))|0);
   var $117=(($mem+$_sum271)|0);
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=((1376+($119<<2))|0);
   var $121=HEAP32[(($120)>>2)];
   var $122=(($69)|(0))==(($121)|(0));
   if ($122) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($120)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $124=HEAP32[(($118)>>2)];
   var $125=1 << $124;
   var $126=$125 ^ -1;
   var $127=HEAP32[((((1076)|0))>>2)];
   var $128=$127 & $126;
   HEAP32[((((1076)|0))>>2)]=$128;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 38: 
   var $130=$72;
   var $131=HEAP32[((((1088)|0))>>2)];
   var $132=(($130)>>>(0)) < (($131)>>>(0));
   if ($132) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $134=(($72+16)|0);
   var $135=HEAP32[(($134)>>2)];
   var $136=(($135)|(0))==(($69)|(0));
   if ($136) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($134)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $139=(($72+20)|0);
   HEAP32[(($139)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $142=(($R_1)|(0))==0;
   if ($142) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $144=$R_1;
   var $145=HEAP32[((((1088)|0))>>2)];
   var $146=(($144)>>>(0)) < (($145)>>>(0));
   if ($146) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $148=(($R_1+24)|0);
   HEAP32[(($148)>>2)]=$72;
   var $_sum272=((($_sum233)+(16))|0);
   var $149=(($mem+$_sum272)|0);
   var $150=$149;
   var $151=HEAP32[(($150)>>2)];
   var $152=(($151)|(0))==0;
   if ($152) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $154=$151;
   var $155=HEAP32[((((1088)|0))>>2)];
   var $156=(($154)>>>(0)) < (($155)>>>(0));
   if ($156) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $158=(($R_1+16)|0);
   HEAP32[(($158)>>2)]=$151;
   var $159=(($151+24)|0);
   HEAP32[(($159)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $_sum273=((($_sum233)+(20))|0);
   var $162=(($mem+$_sum273)|0);
   var $163=$162;
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==0;
   if ($165) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $167=$164;
   var $168=HEAP32[((((1088)|0))>>2)];
   var $169=(($167)>>>(0)) < (($168)>>>(0));
   if ($169) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $171=(($R_1+20)|0);
   HEAP32[(($171)>>2)]=$164;
   var $172=(($164+24)|0);
   HEAP32[(($172)>>2)]=$R_1;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $_sum234=((($14)-(4))|0);
   var $176=(($mem+$_sum234)|0);
   var $177=$176;
   var $178=HEAP32[(($177)>>2)];
   var $179=$178 & 3;
   var $180=(($179)|(0))==3;
   if ($180) { label = 55; break; } else { var $p_0 = $25;var $psize_0 = $26;label = 56; break; }
  case 55: 
   HEAP32[((((1080)|0))>>2)]=$26;
   var $182=HEAP32[(($177)>>2)];
   var $183=$182 & -2;
   HEAP32[(($177)>>2)]=$183;
   var $184=$26 | 1;
   var $_sum265=((($_sum233)+(4))|0);
   var $185=(($mem+$_sum265)|0);
   var $186=$185;
   HEAP32[(($186)>>2)]=$184;
   var $187=$15;
   HEAP32[(($187)>>2)]=$26;
   label = 160; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $189=$p_0;
   var $190=(($189)>>>(0)) < (($15)>>>(0));
   if ($190) { label = 57; break; } else { label = 159; break; }
  case 57: 
   var $_sum264=((($14)-(4))|0);
   var $192=(($mem+$_sum264)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 & 1;
   var $phitmp=(($195)|(0))==0;
   if ($phitmp) { label = 159; break; } else { label = 58; break; }
  case 58: 
   var $197=$194 & 2;
   var $198=(($197)|(0))==0;
   if ($198) { label = 59; break; } else { label = 132; break; }
  case 59: 
   var $200=HEAP32[((((1096)|0))>>2)];
   var $201=(($16)|(0))==(($200)|(0));
   if ($201) { label = 60; break; } else { label = 82; break; }
  case 60: 
   var $203=HEAP32[((((1084)|0))>>2)];
   var $204=((($203)+($psize_0))|0);
   HEAP32[((((1084)|0))>>2)]=$204;
   HEAP32[((((1096)|0))>>2)]=$p_0;
   var $205=$204 | 1;
   var $206=(($p_0+4)|0);
   HEAP32[(($206)>>2)]=$205;
   var $207=HEAP32[((((1092)|0))>>2)];
   var $208=(($p_0)|(0))==(($207)|(0));
   if ($208) { label = 61; break; } else { label = 62; break; }
  case 61: 
   HEAP32[((((1092)|0))>>2)]=0;
   HEAP32[((((1080)|0))>>2)]=0;
   label = 62; break;
  case 62: 
   var $211=HEAP32[((((1100)|0))>>2)];
   var $212=(($204)>>>(0)) > (($211)>>>(0));
   if ($212) { label = 63; break; } else { label = 160; break; }
  case 63: 
   var $214=HEAP32[((((1048)|0))>>2)];
   var $215=(($214)|(0))==0;
   if ($215) { label = 64; break; } else { label = 67; break; }
  case 64: 
   var $217=_sysconf(8);
   var $218=((($217)-(1))|0);
   var $219=$218 & $217;
   var $220=(($219)|(0))==0;
   if ($220) { label = 66; break; } else { label = 65; break; }
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   HEAP32[((((1056)|0))>>2)]=$217;
   HEAP32[((((1052)|0))>>2)]=$217;
   HEAP32[((((1060)|0))>>2)]=-1;
   HEAP32[((((1064)|0))>>2)]=2097152;
   HEAP32[((((1068)|0))>>2)]=0;
   HEAP32[((((1516)|0))>>2)]=0;
   var $222=_time(0);
   var $223=$222 & -16;
   var $224=$223 ^ 1431655768;
   HEAP32[((((1048)|0))>>2)]=$224;
   label = 67; break;
  case 67: 
   var $226=HEAP32[((((1096)|0))>>2)];
   var $227=(($226)|(0))==0;
   if ($227) { label = 160; break; } else { label = 68; break; }
  case 68: 
   var $229=HEAP32[((((1084)|0))>>2)];
   var $230=(($229)>>>(0)) > 40;
   if ($230) { label = 69; break; } else { label = 80; break; }
  case 69: 
   var $232=HEAP32[((((1056)|0))>>2)];
   var $233=((($229)-(41))|0);
   var $234=((($233)+($232))|0);
   var $235=((((($234)>>>(0)))/((($232)>>>(0))))&-1);
   var $236=((($235)-(1))|0);
   var $237=(Math.imul($236,$232)|0);
   var $238=$226;
   var $sp_0_i_i = ((1520)|0);label = 70; break;
  case 70: 
   var $sp_0_i_i;
   var $240=(($sp_0_i_i)|0);
   var $241=HEAP32[(($240)>>2)];
   var $242=(($241)>>>(0)) > (($238)>>>(0));
   if ($242) { label = 72; break; } else { label = 71; break; }
  case 71: 
   var $244=(($sp_0_i_i+4)|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=(($241+$245)|0);
   var $247=(($246)>>>(0)) > (($238)>>>(0));
   if ($247) { var $_0_i_i = $sp_0_i_i;label = 73; break; } else { label = 72; break; }
  case 72: 
   var $249=(($sp_0_i_i+8)|0);
   var $250=HEAP32[(($249)>>2)];
   var $251=(($250)|(0))==0;
   if ($251) { var $_0_i_i = 0;label = 73; break; } else { var $sp_0_i_i = $250;label = 70; break; }
  case 73: 
   var $_0_i_i;
   var $252=(($_0_i_i+12)|0);
   var $253=HEAP32[(($252)>>2)];
   var $254=$253 & 8;
   var $255=(($254)|(0))==0;
   if ($255) { label = 74; break; } else { label = 80; break; }
  case 74: 
   var $257=_sbrk(0);
   var $258=(($_0_i_i)|0);
   var $259=HEAP32[(($258)>>2)];
   var $260=(($_0_i_i+4)|0);
   var $261=HEAP32[(($260)>>2)];
   var $262=(($259+$261)|0);
   var $263=(($257)|(0))==(($262)|(0));
   if ($263) { label = 75; break; } else { label = 80; break; }
  case 75: 
   var $265=(((-2147483648)-($232))|0);
   var $266=(($237)>>>(0)) > 2147483646;
   var $__i=$266 ? $265 : $237;
   var $267=(((-$__i))|0);
   var $268=_sbrk($267);
   var $269=_sbrk(0);
   var $270=(($268)|(0))!=-1;
   var $271=(($269)>>>(0)) < (($257)>>>(0));
   var $or_cond_i=$270 & $271;
   if ($or_cond_i) { label = 76; break; } else { label = 80; break; }
  case 76: 
   var $273=$257;
   var $274=$269;
   var $275=((($273)-($274))|0);
   var $276=(($257)|(0))==(($269)|(0));
   if ($276) { label = 80; break; } else { label = 77; break; }
  case 77: 
   var $278=HEAP32[(($260)>>2)];
   var $279=((($278)-($275))|0);
   HEAP32[(($260)>>2)]=$279;
   var $280=HEAP32[((((1504)|0))>>2)];
   var $281=((($280)-($275))|0);
   HEAP32[((((1504)|0))>>2)]=$281;
   var $282=HEAP32[((((1096)|0))>>2)];
   var $283=HEAP32[((((1084)|0))>>2)];
   var $284=((($283)-($275))|0);
   var $285=$282;
   var $286=(($282+8)|0);
   var $287=$286;
   var $288=$287 & 7;
   var $289=(($288)|(0))==0;
   if ($289) { var $294 = 0;label = 79; break; } else { label = 78; break; }
  case 78: 
   var $291=(((-$287))|0);
   var $292=$291 & 7;
   var $294 = $292;label = 79; break;
  case 79: 
   var $294;
   var $295=(($285+$294)|0);
   var $296=$295;
   var $297=((($284)-($294))|0);
   HEAP32[((((1096)|0))>>2)]=$296;
   HEAP32[((((1084)|0))>>2)]=$297;
   var $298=$297 | 1;
   var $_sum_i_i=((($294)+(4))|0);
   var $299=(($285+$_sum_i_i)|0);
   var $300=$299;
   HEAP32[(($300)>>2)]=$298;
   var $_sum2_i_i=((($284)+(4))|0);
   var $301=(($285+$_sum2_i_i)|0);
   var $302=$301;
   HEAP32[(($302)>>2)]=40;
   var $303=HEAP32[((((1064)|0))>>2)];
   HEAP32[((((1100)|0))>>2)]=$303;
   label = 160; break;
  case 80: 
   var $304=HEAP32[((((1084)|0))>>2)];
   var $305=HEAP32[((((1100)|0))>>2)];
   var $306=(($304)>>>(0)) > (($305)>>>(0));
   if ($306) { label = 81; break; } else { label = 160; break; }
  case 81: 
   HEAP32[((((1100)|0))>>2)]=-1;
   label = 160; break;
  case 82: 
   var $309=HEAP32[((((1092)|0))>>2)];
   var $310=(($16)|(0))==(($309)|(0));
   if ($310) { label = 83; break; } else { label = 84; break; }
  case 83: 
   var $312=HEAP32[((((1080)|0))>>2)];
   var $313=((($312)+($psize_0))|0);
   HEAP32[((((1080)|0))>>2)]=$313;
   HEAP32[((((1092)|0))>>2)]=$p_0;
   var $314=$313 | 1;
   var $315=(($p_0+4)|0);
   HEAP32[(($315)>>2)]=$314;
   var $316=(($189+$313)|0);
   var $317=$316;
   HEAP32[(($317)>>2)]=$313;
   label = 160; break;
  case 84: 
   var $319=$194 & -8;
   var $320=((($319)+($psize_0))|0);
   var $321=$194 >>> 3;
   var $322=(($194)>>>(0)) < 256;
   if ($322) { label = 85; break; } else { label = 97; break; }
  case 85: 
   var $324=(($mem+$14)|0);
   var $325=$324;
   var $326=HEAP32[(($325)>>2)];
   var $_sum258259=$14 | 4;
   var $327=(($mem+$_sum258259)|0);
   var $328=$327;
   var $329=HEAP32[(($328)>>2)];
   var $330=$321 << 1;
   var $331=((1112+($330<<2))|0);
   var $332=$331;
   var $333=(($326)|(0))==(($332)|(0));
   if ($333) { label = 88; break; } else { label = 86; break; }
  case 86: 
   var $335=$326;
   var $336=HEAP32[((((1088)|0))>>2)];
   var $337=(($335)>>>(0)) < (($336)>>>(0));
   if ($337) { label = 96; break; } else { label = 87; break; }
  case 87: 
   var $339=(($326+12)|0);
   var $340=HEAP32[(($339)>>2)];
   var $341=(($340)|(0))==(($16)|(0));
   if ($341) { label = 88; break; } else { label = 96; break; }
  case 88: 
   var $342=(($329)|(0))==(($326)|(0));
   if ($342) { label = 89; break; } else { label = 90; break; }
  case 89: 
   var $344=1 << $321;
   var $345=$344 ^ -1;
   var $346=HEAP32[((((1072)|0))>>2)];
   var $347=$346 & $345;
   HEAP32[((((1072)|0))>>2)]=$347;
   label = 130; break;
  case 90: 
   var $349=(($329)|(0))==(($332)|(0));
   if ($349) { label = 91; break; } else { label = 92; break; }
  case 91: 
   var $_pre304=(($329+8)|0);
   var $_pre_phi305 = $_pre304;label = 94; break;
  case 92: 
   var $351=$329;
   var $352=HEAP32[((((1088)|0))>>2)];
   var $353=(($351)>>>(0)) < (($352)>>>(0));
   if ($353) { label = 95; break; } else { label = 93; break; }
  case 93: 
   var $355=(($329+8)|0);
   var $356=HEAP32[(($355)>>2)];
   var $357=(($356)|(0))==(($16)|(0));
   if ($357) { var $_pre_phi305 = $355;label = 94; break; } else { label = 95; break; }
  case 94: 
   var $_pre_phi305;
   var $358=(($326+12)|0);
   HEAP32[(($358)>>2)]=$329;
   HEAP32[(($_pre_phi305)>>2)]=$326;
   label = 130; break;
  case 95: 
   _abort();
   throw "Reached an unreachable!";
  case 96: 
   _abort();
   throw "Reached an unreachable!";
  case 97: 
   var $360=$15;
   var $_sum236=((($14)+(16))|0);
   var $361=(($mem+$_sum236)|0);
   var $362=$361;
   var $363=HEAP32[(($362)>>2)];
   var $_sum237238=$14 | 4;
   var $364=(($mem+$_sum237238)|0);
   var $365=$364;
   var $366=HEAP32[(($365)>>2)];
   var $367=(($366)|(0))==(($360)|(0));
   if ($367) { label = 103; break; } else { label = 98; break; }
  case 98: 
   var $369=(($mem+$14)|0);
   var $370=$369;
   var $371=HEAP32[(($370)>>2)];
   var $372=$371;
   var $373=HEAP32[((((1088)|0))>>2)];
   var $374=(($372)>>>(0)) < (($373)>>>(0));
   if ($374) { label = 102; break; } else { label = 99; break; }
  case 99: 
   var $376=(($371+12)|0);
   var $377=HEAP32[(($376)>>2)];
   var $378=(($377)|(0))==(($360)|(0));
   if ($378) { label = 100; break; } else { label = 102; break; }
  case 100: 
   var $380=(($366+8)|0);
   var $381=HEAP32[(($380)>>2)];
   var $382=(($381)|(0))==(($360)|(0));
   if ($382) { label = 101; break; } else { label = 102; break; }
  case 101: 
   HEAP32[(($376)>>2)]=$366;
   HEAP32[(($380)>>2)]=$371;
   var $R7_1 = $366;label = 110; break;
  case 102: 
   _abort();
   throw "Reached an unreachable!";
  case 103: 
   var $_sum240=((($14)+(12))|0);
   var $385=(($mem+$_sum240)|0);
   var $386=$385;
   var $387=HEAP32[(($386)>>2)];
   var $388=(($387)|(0))==0;
   if ($388) { label = 104; break; } else { var $R7_0 = $387;var $RP9_0 = $386;label = 105; break; }
  case 104: 
   var $_sum239=((($14)+(8))|0);
   var $390=(($mem+$_sum239)|0);
   var $391=$390;
   var $392=HEAP32[(($391)>>2)];
   var $393=(($392)|(0))==0;
   if ($393) { var $R7_1 = 0;label = 110; break; } else { var $R7_0 = $392;var $RP9_0 = $391;label = 105; break; }
  case 105: 
   var $RP9_0;
   var $R7_0;
   var $394=(($R7_0+20)|0);
   var $395=HEAP32[(($394)>>2)];
   var $396=(($395)|(0))==0;
   if ($396) { label = 106; break; } else { var $R7_0 = $395;var $RP9_0 = $394;label = 105; break; }
  case 106: 
   var $398=(($R7_0+16)|0);
   var $399=HEAP32[(($398)>>2)];
   var $400=(($399)|(0))==0;
   if ($400) { label = 107; break; } else { var $R7_0 = $399;var $RP9_0 = $398;label = 105; break; }
  case 107: 
   var $402=$RP9_0;
   var $403=HEAP32[((((1088)|0))>>2)];
   var $404=(($402)>>>(0)) < (($403)>>>(0));
   if ($404) { label = 109; break; } else { label = 108; break; }
  case 108: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 110; break;
  case 109: 
   _abort();
   throw "Reached an unreachable!";
  case 110: 
   var $R7_1;
   var $408=(($363)|(0))==0;
   if ($408) { label = 130; break; } else { label = 111; break; }
  case 111: 
   var $_sum251=((($14)+(20))|0);
   var $410=(($mem+$_sum251)|0);
   var $411=$410;
   var $412=HEAP32[(($411)>>2)];
   var $413=((1376+($412<<2))|0);
   var $414=HEAP32[(($413)>>2)];
   var $415=(($360)|(0))==(($414)|(0));
   if ($415) { label = 112; break; } else { label = 114; break; }
  case 112: 
   HEAP32[(($413)>>2)]=$R7_1;
   var $cond299=(($R7_1)|(0))==0;
   if ($cond299) { label = 113; break; } else { label = 120; break; }
  case 113: 
   var $417=HEAP32[(($411)>>2)];
   var $418=1 << $417;
   var $419=$418 ^ -1;
   var $420=HEAP32[((((1076)|0))>>2)];
   var $421=$420 & $419;
   HEAP32[((((1076)|0))>>2)]=$421;
   label = 130; break;
  case 114: 
   var $423=$363;
   var $424=HEAP32[((((1088)|0))>>2)];
   var $425=(($423)>>>(0)) < (($424)>>>(0));
   if ($425) { label = 118; break; } else { label = 115; break; }
  case 115: 
   var $427=(($363+16)|0);
   var $428=HEAP32[(($427)>>2)];
   var $429=(($428)|(0))==(($360)|(0));
   if ($429) { label = 116; break; } else { label = 117; break; }
  case 116: 
   HEAP32[(($427)>>2)]=$R7_1;
   label = 119; break;
  case 117: 
   var $432=(($363+20)|0);
   HEAP32[(($432)>>2)]=$R7_1;
   label = 119; break;
  case 118: 
   _abort();
   throw "Reached an unreachable!";
  case 119: 
   var $435=(($R7_1)|(0))==0;
   if ($435) { label = 130; break; } else { label = 120; break; }
  case 120: 
   var $437=$R7_1;
   var $438=HEAP32[((((1088)|0))>>2)];
   var $439=(($437)>>>(0)) < (($438)>>>(0));
   if ($439) { label = 129; break; } else { label = 121; break; }
  case 121: 
   var $441=(($R7_1+24)|0);
   HEAP32[(($441)>>2)]=$363;
   var $_sum252=((($14)+(8))|0);
   var $442=(($mem+$_sum252)|0);
   var $443=$442;
   var $444=HEAP32[(($443)>>2)];
   var $445=(($444)|(0))==0;
   if ($445) { label = 125; break; } else { label = 122; break; }
  case 122: 
   var $447=$444;
   var $448=HEAP32[((((1088)|0))>>2)];
   var $449=(($447)>>>(0)) < (($448)>>>(0));
   if ($449) { label = 124; break; } else { label = 123; break; }
  case 123: 
   var $451=(($R7_1+16)|0);
   HEAP32[(($451)>>2)]=$444;
   var $452=(($444+24)|0);
   HEAP32[(($452)>>2)]=$R7_1;
   label = 125; break;
  case 124: 
   _abort();
   throw "Reached an unreachable!";
  case 125: 
   var $_sum253=((($14)+(12))|0);
   var $455=(($mem+$_sum253)|0);
   var $456=$455;
   var $457=HEAP32[(($456)>>2)];
   var $458=(($457)|(0))==0;
   if ($458) { label = 130; break; } else { label = 126; break; }
  case 126: 
   var $460=$457;
   var $461=HEAP32[((((1088)|0))>>2)];
   var $462=(($460)>>>(0)) < (($461)>>>(0));
   if ($462) { label = 128; break; } else { label = 127; break; }
  case 127: 
   var $464=(($R7_1+20)|0);
   HEAP32[(($464)>>2)]=$457;
   var $465=(($457+24)|0);
   HEAP32[(($465)>>2)]=$R7_1;
   label = 130; break;
  case 128: 
   _abort();
   throw "Reached an unreachable!";
  case 129: 
   _abort();
   throw "Reached an unreachable!";
  case 130: 
   var $469=$320 | 1;
   var $470=(($p_0+4)|0);
   HEAP32[(($470)>>2)]=$469;
   var $471=(($189+$320)|0);
   var $472=$471;
   HEAP32[(($472)>>2)]=$320;
   var $473=HEAP32[((((1092)|0))>>2)];
   var $474=(($p_0)|(0))==(($473)|(0));
   if ($474) { label = 131; break; } else { var $psize_1 = $320;label = 133; break; }
  case 131: 
   HEAP32[((((1080)|0))>>2)]=$320;
   label = 160; break;
  case 132: 
   var $477=$194 & -2;
   HEAP32[(($193)>>2)]=$477;
   var $478=$psize_0 | 1;
   var $479=(($p_0+4)|0);
   HEAP32[(($479)>>2)]=$478;
   var $480=(($189+$psize_0)|0);
   var $481=$480;
   HEAP32[(($481)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 133; break;
  case 133: 
   var $psize_1;
   var $483=$psize_1 >>> 3;
   var $484=(($psize_1)>>>(0)) < 256;
   if ($484) { label = 134; break; } else { label = 139; break; }
  case 134: 
   var $486=$483 << 1;
   var $487=((1112+($486<<2))|0);
   var $488=$487;
   var $489=HEAP32[((((1072)|0))>>2)];
   var $490=1 << $483;
   var $491=$489 & $490;
   var $492=(($491)|(0))==0;
   if ($492) { label = 135; break; } else { label = 136; break; }
  case 135: 
   var $494=$489 | $490;
   HEAP32[((((1072)|0))>>2)]=$494;
   var $_sum249_pre=((($486)+(2))|0);
   var $_pre=((1112+($_sum249_pre<<2))|0);
   var $F16_0 = $488;var $_pre_phi = $_pre;label = 138; break;
  case 136: 
   var $_sum250=((($486)+(2))|0);
   var $496=((1112+($_sum250<<2))|0);
   var $497=HEAP32[(($496)>>2)];
   var $498=$497;
   var $499=HEAP32[((((1088)|0))>>2)];
   var $500=(($498)>>>(0)) < (($499)>>>(0));
   if ($500) { label = 137; break; } else { var $F16_0 = $497;var $_pre_phi = $496;label = 138; break; }
  case 137: 
   _abort();
   throw "Reached an unreachable!";
  case 138: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $503=(($F16_0+12)|0);
   HEAP32[(($503)>>2)]=$p_0;
   var $504=(($p_0+8)|0);
   HEAP32[(($504)>>2)]=$F16_0;
   var $505=(($p_0+12)|0);
   HEAP32[(($505)>>2)]=$488;
   label = 160; break;
  case 139: 
   var $507=$p_0;
   var $508=$psize_1 >>> 8;
   var $509=(($508)|(0))==0;
   if ($509) { var $I18_0 = 0;label = 142; break; } else { label = 140; break; }
  case 140: 
   var $511=(($psize_1)>>>(0)) > 16777215;
   if ($511) { var $I18_0 = 31;label = 142; break; } else { label = 141; break; }
  case 141: 
   var $513=((($508)+(1048320))|0);
   var $514=$513 >>> 16;
   var $515=$514 & 8;
   var $516=$508 << $515;
   var $517=((($516)+(520192))|0);
   var $518=$517 >>> 16;
   var $519=$518 & 4;
   var $520=$519 | $515;
   var $521=$516 << $519;
   var $522=((($521)+(245760))|0);
   var $523=$522 >>> 16;
   var $524=$523 & 2;
   var $525=$520 | $524;
   var $526=(((14)-($525))|0);
   var $527=$521 << $524;
   var $528=$527 >>> 15;
   var $529=((($526)+($528))|0);
   var $530=$529 << 1;
   var $531=((($529)+(7))|0);
   var $532=$psize_1 >>> (($531)>>>(0));
   var $533=$532 & 1;
   var $534=$533 | $530;
   var $I18_0 = $534;label = 142; break;
  case 142: 
   var $I18_0;
   var $536=((1376+($I18_0<<2))|0);
   var $537=(($p_0+28)|0);
   var $I18_0_c=$I18_0;
   HEAP32[(($537)>>2)]=$I18_0_c;
   var $538=(($p_0+20)|0);
   HEAP32[(($538)>>2)]=0;
   var $539=(($p_0+16)|0);
   HEAP32[(($539)>>2)]=0;
   var $540=HEAP32[((((1076)|0))>>2)];
   var $541=1 << $I18_0;
   var $542=$540 & $541;
   var $543=(($542)|(0))==0;
   if ($543) { label = 143; break; } else { label = 144; break; }
  case 143: 
   var $545=$540 | $541;
   HEAP32[((((1076)|0))>>2)]=$545;
   HEAP32[(($536)>>2)]=$507;
   var $546=(($p_0+24)|0);
   var $_c=$536;
   HEAP32[(($546)>>2)]=$_c;
   var $547=(($p_0+12)|0);
   HEAP32[(($547)>>2)]=$p_0;
   var $548=(($p_0+8)|0);
   HEAP32[(($548)>>2)]=$p_0;
   label = 156; break;
  case 144: 
   var $550=HEAP32[(($536)>>2)];
   var $551=(($I18_0)|(0))==31;
   if ($551) { var $556 = 0;label = 146; break; } else { label = 145; break; }
  case 145: 
   var $553=$I18_0 >>> 1;
   var $554=(((25)-($553))|0);
   var $556 = $554;label = 146; break;
  case 146: 
   var $556;
   var $557=$psize_1 << $556;
   var $K19_0 = $557;var $T_0 = $550;label = 147; break;
  case 147: 
   var $T_0;
   var $K19_0;
   var $559=(($T_0+4)|0);
   var $560=HEAP32[(($559)>>2)];
   var $561=$560 & -8;
   var $562=(($561)|(0))==(($psize_1)|(0));
   if ($562) { label = 152; break; } else { label = 148; break; }
  case 148: 
   var $564=$K19_0 >>> 31;
   var $565=(($T_0+16+($564<<2))|0);
   var $566=HEAP32[(($565)>>2)];
   var $567=(($566)|(0))==0;
   var $568=$K19_0 << 1;
   if ($567) { label = 149; break; } else { var $K19_0 = $568;var $T_0 = $566;label = 147; break; }
  case 149: 
   var $570=$565;
   var $571=HEAP32[((((1088)|0))>>2)];
   var $572=(($570)>>>(0)) < (($571)>>>(0));
   if ($572) { label = 151; break; } else { label = 150; break; }
  case 150: 
   HEAP32[(($565)>>2)]=$507;
   var $574=(($p_0+24)|0);
   var $T_0_c246=$T_0;
   HEAP32[(($574)>>2)]=$T_0_c246;
   var $575=(($p_0+12)|0);
   HEAP32[(($575)>>2)]=$p_0;
   var $576=(($p_0+8)|0);
   HEAP32[(($576)>>2)]=$p_0;
   label = 156; break;
  case 151: 
   _abort();
   throw "Reached an unreachable!";
  case 152: 
   var $579=(($T_0+8)|0);
   var $580=HEAP32[(($579)>>2)];
   var $581=$T_0;
   var $582=HEAP32[((((1088)|0))>>2)];
   var $583=(($581)>>>(0)) < (($582)>>>(0));
   if ($583) { label = 155; break; } else { label = 153; break; }
  case 153: 
   var $585=$580;
   var $586=(($585)>>>(0)) < (($582)>>>(0));
   if ($586) { label = 155; break; } else { label = 154; break; }
  case 154: 
   var $588=(($580+12)|0);
   HEAP32[(($588)>>2)]=$507;
   HEAP32[(($579)>>2)]=$507;
   var $589=(($p_0+8)|0);
   var $_c245=$580;
   HEAP32[(($589)>>2)]=$_c245;
   var $590=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($590)>>2)]=$T_0_c;
   var $591=(($p_0+24)|0);
   HEAP32[(($591)>>2)]=0;
   label = 156; break;
  case 155: 
   _abort();
   throw "Reached an unreachable!";
  case 156: 
   var $593=HEAP32[((((1104)|0))>>2)];
   var $594=((($593)-(1))|0);
   HEAP32[((((1104)|0))>>2)]=$594;
   var $595=(($594)|(0))==0;
   if ($595) { var $sp_0_in_i = ((1528)|0);label = 157; break; } else { label = 160; break; }
  case 157: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $596=(($sp_0_i)|(0))==0;
   var $597=(($sp_0_i+8)|0);
   if ($596) { label = 158; break; } else { var $sp_0_in_i = $597;label = 157; break; }
  case 158: 
   HEAP32[((((1104)|0))>>2)]=-1;
   label = 160; break;
  case 159: 
   _abort();
   throw "Reached an unreachable!";
  case 160: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
/*global Module*/
/*global _malloc, _free, _memcpy*/
/*global FUNCTION_TABLE, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32*/
/*global readLatin1String*/
/*global __emval_register, _emval_handle_array, __emval_decref*/
/*global ___getTypeName*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */
var InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
var BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
var UnboundTypeError = Module['UnboundTypeError'] = extendError(BindingError, 'UnboundTypeError');
function throwInternalError(message) {
    throw new InternalError(message);
}
function throwBindingError(message) {
    throw new BindingError(message);
}
function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};
    function visit(type) {
        if (seen[type]) {
            return;
        }
        if (registeredTypes[type]) {
            return;
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
        }
        unboundTypes.push(type);
        seen[type] = true;
    }
    types.forEach(visit);
    throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
}
// Creates a function overload resolution table to the given method 'methodName' in the given prototype,
// if the overload table doesn't yet exist.
function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function() {
            // TODO This check can be removed in -O3 level "unsafe" optimizations.
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    }            
}
/* Registers a symbol (function, class, enum, ...) as part of the Module JS object so that
   hand-written code is able to access that symbol via 'Module.name'.
   name: The name of the symbol that's being exposed.
   value: The object itself to expose (function, class, ...)
   numArguments: For functions, specifies the number of arguments the function takes in. For other types, unused and undefined.
   To implement support for multiple overloads of a function, an 'overload selector' function is used. That selector function chooses
   the appropriate overload to call from an function overload table. This selector function is only used if multiple overloads are
   actually registered, since it carries a slight performance penalty. */
function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
            throwBindingError("Cannot register public name '" + name + "' twice");
        }
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
        }
    }
}
function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistant public symbol');
    }
    // If there's an overload table for this symbol, replace the symbol in the overload table instead.
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
    }
}
// from https://github.com/imvu/imvujs/blob/master/src/error.js
function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + '\n' +
                stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function() {
        if (this.message === undefined) {
            return this.name;
        } else {
            return this.name + ': ' + this.message;
        }
    };
    return errorClass;
}
// from https://github.com/imvu/imvujs/blob/master/src/function.js
function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    /*jshint evil:true*/
    return new Function(
        "body",
        "return function " + name + "() {\n" +
        "    \"use strict\";" +
        "    return body.apply(this, arguments);\n" +
        "};\n"
    )(body);
}
function _embind_repr(v) {
    var t = typeof v;
    if (t === 'object' || t === 'array' || t === 'function') {
        return v.toString();
    } else {
        return '' + v;
    }
}
// typeID -> { toWireType: ..., fromWireType: ... }
var registeredTypes = {};
// typeID -> [callback]
var awaitingDependencies = {};
// typeID -> [dependentTypes]
var typeDependencies = {};
// class typeID -> {pointerType: ..., constPointerType: ...}
var registeredPointers = {};
function registerType(rawType, registeredInstance) {
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        throwBindingError("Cannot register type '" + name + "' twice");
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
            cb();
        });
    }
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
    });
    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
        }
    }
    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function(dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(function() {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters);
                }
            });
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
    }
}
var __charCodes = (function() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
    }
    return codes;
})();
function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += __charCodes[HEAPU8[c++]];
    }
    return ret;
}
function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv;
}
function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i]);
    }
    return array;
}
function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
    }
    return impl;
}
function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function() {
            return undefined;
        },
        'toWireType': function(destructors, o) {
            // TODO: assert if anything else is given?
            return undefined;
        },
    });
}
function __embind_register_bool(rawType, name, trueValue, falseValue) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(wt) {
            // ambiguous emscripten ABI: sometimes return values are
            // true or false, and sometimes integers (0 or 1)
            return !!wt;
        },
        'toWireType': function(destructors, o) {
            return o ? trueValue : falseValue;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
// When converting a number from JS to C++ side, the valid range of the number is
// [minRange, maxRange], inclusive.
function __embind_register_integer(primitiveType, name, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
        maxRange = 4294967295;
    }
    registerType(primitiveType, {
        name: name,
        minRange: minRange,
        maxRange: maxRange,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following two if()s and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
            }
            return value | 0;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_float(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following if() and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            return value;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value);
            }
            function getTAElement(ta, index) {
                return ta[index];
            }
            function getStringElement(string, index) {
                return string.charCodeAt(index);
            }
            var getElement;
            if (value instanceof Uint8Array) {
                getElement = getTAElement;
            } else if (value instanceof Int8Array) {
                getElement = getTAElement;
            } else if (typeof value === 'string') {
                getElement = getStringElement;
            } else {
                throwBindingError('Cannot pass non-string to std::string');
            }
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length);
            HEAPU32[ptr >> 2] = length;
            for (var i = 0; i < length; ++i) {
                var charCode = getElement(value, i);
                if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + 4 + i] = charCode;
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        destructorFunction: function(ptr) { _free(ptr); },
    });
}
function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var HEAP, shift;
    if (charSize === 2) {
        HEAP = HEAPU16;
        shift = 1;
    } else if (charSize === 4) {
        HEAP = HEAPU32;
        shift = 2;
    }
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = (value + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            HEAPU32[ptr >> 2] = length;
            var start = (ptr + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i);
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        destructorFunction: function(ptr) { _free(ptr); },
    });
}
function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var rv = _emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv;
        },
        'toWireType': function(destructors, value) {
            return __emval_register(value);
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_memory_view(rawType, name) {
    var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,        
    ];
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var type = HEAPU32[handle >> 2];
            var size = HEAPU32[(handle >> 2) + 1]; // in elements
            var data = HEAPU32[(handle >> 2) + 2]; // byte offset into emscripten heap
            var TA = typeMapping[type];
            return new TA(HEAP8.buffer, data, size);
        },
    });
}
function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    }
}
// Function implementation of operator new, per
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
// 13.2.2
// ES3
function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError('new_ called with constructor type ' + typeof(constructor) + " which is not a function");
    }
    /*
     * Previously, the following line was just:
     function dummy() {};
     * Unfortunately, Chrome was preserving 'dummy' as the object's name, even though at creation, the 'dummy' has the
     * correct constructor name.  Thus, objects created with IMVU.new would show up in the debugger as 'dummy', which
     * isn't very helpful.  Using IMVU.createNamedFunction addresses the issue.  Doublely-unfortunately, there's no way
     * to write a test for this behavior.  -NRD 2013.02.22
     */
    var dummy = createNamedFunction(constructor.name, function(){});
    dummy.prototype = constructor.prototype;
    var obj = new dummy;
    var r = constructor.apply(obj, argumentList);
    return (r instanceof Object) ? r : obj;
}
// The path to interop from JS code to C++ code:
// (hand-written JS code) -> (autogenerated JS invoker) -> (template-generated C++ invoker) -> (target C++ function)
// craftInvokerFunction generates the JS invoker function for each function exposed to JS through embind.
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    // humanName: a human-readable string name for the function to be generated.
    // argTypes: An array that contains the embind type objects for all types in the function signature.
    //    argTypes[0] is the type object for the function return value.
    //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
    //    argTypes[2...] are the actual function parameters.
    // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
    // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
    // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
    }
    var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
    if (!isClassMethodFunc && !FUNCTION_TABLE[cppTargetFunc]) {
        throwBindingError('Global function '+humanName+' is not defined!');
    }
    // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
// TODO: This omits argument count check - enable only at -O3 or similar.
//    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
//       return FUNCTION_TABLE[fn];
//    }
    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount-2; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i;
        argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
    }
    var invokerFnBody =
        "return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n" +
        "if (arguments.length !== "+(argCount - 2)+") {\n" +
            "throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount - 2)+" args!');\n" +
        "}\n";
    // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
    // TODO: Remove this completely once all function invokers are being dynamically generated.
    var needsDestructorStack = false;
    for(var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
            needsDestructorStack = true;
            break;
        }
    }
    if (needsDestructorStack) {
        invokerFnBody +=
            "var destructors = [];\n";
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "classType", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, classType, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
    }
    for(var i = 0; i < argCount-2; ++i) {
        invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2]);
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
    }
    var returns = (argTypes[0].name !== "void");
    invokerFnBody +=
        (returns?"var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
    } else {
        for(var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
            var paramName = (i === 1 ? "thisWired" : ("arg"+(i-2)+"Wired"));
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
                args1.push(paramName+"_dtor");
                args2.push(argTypes[i].destructorFunction);
            }
        }
    }
    if (returns) {
        invokerFnBody += "return retType.fromWireType(rv);\n";
    }
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __embind_register_function(name, argCount, rawArgTypesAddr, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    exposePublicSymbol(name, function() {
        throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes);
    }, argCount - 1);
    whenDependentTypesAreResolved([], argTypes, function(argTypes) {
        var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn), argCount - 1);
        return [];
    });
}
var tupleRegistrations = {};
function __embind_register_value_array(rawType, name, rawConstructor, rawDestructor) {
    tupleRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: FUNCTION_TABLE[rawConstructor],
        rawDestructor: FUNCTION_TABLE[rawDestructor],
        elements: [],
    };
}
function __embind_register_value_array_element(
    rawTupleType,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    tupleRegistrations[rawTupleType].elements.push({
        getterReturnType: getterReturnType,
        getter: FUNCTION_TABLE[getter],
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: FUNCTION_TABLE[setter],
        setterContext: setterContext,
    });
}
function __embind_finalize_value_array(rawTupleType) {
    var reg = tupleRegistrations[rawTupleType];
    delete tupleRegistrations[rawTupleType];
    var elements = reg.elements;
    var elementsLength = elements.length;
    var elementTypes = elements.map(function(elt) { return elt.getterReturnType; }).
                concat(elements.map(function(elt) { return elt.setterArgumentType; }));
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    whenDependentTypesAreResolved([rawTupleType], elementTypes, function(elementTypes) {
        elements.forEach(function(elt, i) {
            var getterReturnType = elementTypes[i];
            var getter = elt.getter;
            var getterContext = elt.getterContext;
            var setterArgumentType = elementTypes[i + elementsLength];
            var setter = elt.setter;
            var setterContext = elt.setterContext;
            elt.read = function(ptr) {
                return getterReturnType['fromWireType'](getter(getterContext, ptr));
            };
            elt.write = function(ptr, o) {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                runDestructors(destructors);
            };
        });
        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = new Array(elementsLength);
                for (var i = 0; i < elementsLength; ++i) {
                    rv[i] = elements[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                if (elementsLength !== o.length) {
                    throw new TypeError("Incorrect number of tuple elements for " + reg.name + ": expected=" + elementsLength + ", actual=" + o.length);
                }
                var ptr = rawConstructor();
                for (var i = 0; i < elementsLength; ++i) {
                    elements[i].write(ptr, o[i]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            destructorFunction: rawDestructor,
        }];
    });
}
var structRegistrations = {};
function __embind_register_value_object(
    rawType,
    name,
    rawConstructor,
    rawDestructor
) {
    structRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: FUNCTION_TABLE[rawConstructor],
        rawDestructor: FUNCTION_TABLE[rawDestructor],
        fields: [],
    };
}
function __embind_register_value_object_field(
    structType,
    fieldName,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    structRegistrations[structType].fields.push({
        fieldName: readLatin1String(fieldName),
        getterReturnType: getterReturnType,
        getter: FUNCTION_TABLE[getter],
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: FUNCTION_TABLE[setter],
        setterContext: setterContext,
    });
}
function __embind_finalize_value_object(structType) {
    var reg = structRegistrations[structType];
    delete structRegistrations[structType];
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    var fieldRecords = reg.fields;
    var fieldTypes = fieldRecords.map(function(field) { return field.getterReturnType; }).
              concat(fieldRecords.map(function(field) { return field.setterArgumentType; }));
    whenDependentTypesAreResolved([structType], fieldTypes, function(fieldTypes) {
        var fields = {};
        fieldRecords.forEach(function(field, i) {
            var fieldName = field.fieldName;
            var getterReturnType = fieldTypes[i];
            var getter = field.getter;
            var getterContext = field.getterContext;
            var setterArgumentType = fieldTypes[i + fieldRecords.length];
            var setter = field.setter;
            var setterContext = field.setterContext;
            fields[fieldName] = {
                read: function(ptr) {
                    return getterReturnType['fromWireType'](
                        getter(getterContext, ptr));
                },
                write: function(ptr, o) {
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                    runDestructors(destructors);
                }
            };
        });
        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = {};
                for (var i in fields) {
                    rv[i] = fields[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                // todo: Here we have an opportunity for -O3 level "unsafe" optimizations:
                // assume all fields are present without checking.
                for (var fieldName in fields) {
                    if (!(fieldName in o)) {
                        throw new TypeError('Missing field');
                    }
                }
                var ptr = rawConstructor();
                for (fieldName in fields) {
                    fields[fieldName].write(ptr, o[fieldName]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            destructorFunction: rawDestructor,
        }];
    });
}
var genericPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        if (this.isSmartPointer) {
            var ptr = this.rawConstructor();
            if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
        } else {
            return 0;
        }
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
        switch (this.sharingPolicy) {
            case 0: // NONE
                // no upcasting
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
                }
                break;
            case 1: // INTRUSIVE
                ptr = handle.$$.smartPtr;
                break;
            case 2: // BY_EMVAL
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    var clonedHandle = handle['clone']();
                    ptr = this.rawShare(
                        ptr,
                        __emval_register(function() {
                            clonedHandle['delete']();
                        })
                    );
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr);
                    }
                }
                break;
            default:
                throwBindingError('Unsupporting sharing policy');
        }
    }
    return ptr;
};
// If we know a pointer type is not going to have SmartPtr logic in it, we can
// special-case optimize it a bit (compare to genericPointerToWireType)
var constNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};
// An optimized version for non-const method accesses - there we must additionally restrict that
// the pointer is not a const-pointer.
var nonConstNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};
function RegisteredPointer(
    name,
    registeredClass,
    isReference,
    isConst,
    // smart pointer properties
    isSmartPointer,
    pointeeType,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;
    // smart pointer properties
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;
    if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        }
    } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in 
        //       craftInvokerFunction altogether.
    }
}
RegisteredPointer.prototype.getPointee = function(ptr) {
    if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
    }
    return ptr;
};
RegisteredPointer.prototype.destructor = function(ptr) {
    if (this.rawDestructor) {
        this.rawDestructor(ptr);
    }
};
RegisteredPointer.prototype['fromWireType'] = function(ptr) {
    // ptr is a raw pointer (or a raw smartpointer)
    // rawPointer is a maybe-null raw pointer
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
        this.destructor(ptr);
        return null;
    }
    function makeDefaultHandle() {
        if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: rawPointer,
                smartPtrType: this,
                smartPtr: ptr,
            });
        } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this,
                ptr: ptr,
            });
        }
    }
    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
    }
    var toType;
    if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
    } else {
        toType = registeredPointerRecord.pointerType;
    }
    var dp = downcastPointer(
        rawPointer,
        this.registeredClass,
        toType.registeredClass);
    if (dp === null) {
        return makeDefaultHandle.call(this);
    }
    if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr,
        });
    } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
        });
    }
};
function makeClassHandle(prototype, record) {
    if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
    }
    record.count = { value: 1 };
    return Object.create(prototype, {
        $$: {
            value: record,
        },
    });
}
// root of all pointer and smart pointer handles in embind
function ClassHandle() {
}
function getInstanceTypeName(handle) {
    return handle.$$.ptrType.registeredClass.name;
}
ClassHandle.prototype['isAliasOf'] = function(other) {
    if (!(this instanceof ClassHandle)) {
        return false;
    }
    if (!(other instanceof ClassHandle)) {
        return false;
    }
    var leftClass = this.$$.ptrType.registeredClass;
    var left = this.$$.ptr;
    var rightClass = other.$$.ptrType.registeredClass;
    var right = other.$$.ptr;
    while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
    }
    while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
    }
    return leftClass === rightClass && left === right;
};
function throwInstanceAlreadyDeleted(obj) {
    throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
}
ClassHandle.prototype['clone'] = function() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    var clone = Object.create(Object.getPrototypeOf(this), {
        $$: {
            value: shallowCopy(this.$$),
        }
    });
    clone.$$.count.value += 1;
    return clone;
};
function runDestructor(handle) {
    var $$ = handle.$$;
    if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
    } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
    }
}
ClassHandle.prototype['delete'] = function ClassHandle_delete() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    this.$$.count.value -= 1;
    if (0 === this.$$.count.value) {
        runDestructor(this);
    }
    this.$$.smartPtr = undefined;
    this.$$.ptr = undefined;
};
var deletionQueue = [];
ClassHandle.prototype['isDeleted'] = function isDeleted() {
    return !this.$$.ptr;
};
ClassHandle.prototype['deleteLater'] = function deleteLater() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    deletionQueue.push(this);
    if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
    this.$$.deleteScheduled = true;
    return this;
};
function flushPendingDeletes() {
    while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
    }
}
Module['flushPendingDeletes'] = flushPendingDeletes;
var delayFunction;
Module['setDelayFunction'] = function setDelayFunction(fn) {
    delayFunction = fn;
    if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
};
function RegisteredClass(
    name,
    constructor,
    instancePrototype,
    rawDestructor,
    baseClass,
    getActualType,
    upcast,
    downcast
) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
}
function shallowCopy(o) {
    var rv = {};
    for (var k in o) {
        rv[k] = o[k];
    }
    return rv;
}
function __embind_register_class(
    rawType,
    rawPointerType,
    rawConstPointerType,
    baseClassRawType,
    getActualType,
    upcast,
    downcast,
    name,
    rawDestructor
) {
    name = readLatin1String(name);
    rawDestructor = FUNCTION_TABLE[rawDestructor];
    getActualType = FUNCTION_TABLE[getActualType];
    upcast = FUNCTION_TABLE[upcast];
    downcast = FUNCTION_TABLE[downcast];
    var legalFunctionName = makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
    });
    whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        function(base) {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
                baseClass = base.registeredClass;
                basePrototype = baseClass.instancePrototype;
            } else {
                basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(legalFunctionName, function() {
                if (Object.getPrototypeOf(this) !== instancePrototype) {
                    throw new BindingError("Use 'new' to construct " + name);
                }
                if (undefined === registeredClass.constructor_body) {
                    throw new BindingError(name + " has no accessible constructor");
                }
                var body = registeredClass.constructor_body[arguments.length];
                if (undefined === body) {
                    throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
                }
                return body.apply(this, arguments);
            });
            var instancePrototype = Object.create(basePrototype, {
                constructor: { value: constructor },
            });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(
                name,
                constructor,
                instancePrototype,
                rawDestructor,
                baseClass,
                getActualType,
                upcast,
                downcast);
            var referenceConverter = new RegisteredPointer(
                name,
                registeredClass,
                true,
                false,
                false);
            var pointerConverter = new RegisteredPointer(
                name + '*',
                registeredClass,
                false,
                false,
                false);
            var constPointerConverter = new RegisteredPointer(
                name + ' const*',
                registeredClass,
                false,
                true,
                false);
            registeredPointers[rawType] = {
                pointerType: pointerConverter,
                constPointerType: constPointerConverter
            };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
        }
    );
}
function __embind_register_class_constructor(
    rawClassType,
    argCount,
    rawArgTypesAddr,
    invoker,
    rawConstructor
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = FUNCTION_TABLE[invoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = 'constructor ' + classType.name;
        if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount-1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = function() {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
        };
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            classType.registeredClass.constructor_body[argCount - 1] = function() {
                if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount-1));
                }
                var destructors = [];
                var args = new Array(argCount);
                args[0] = rawConstructor;
                for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1]);
                }
                var ptr = invoker.apply(null, args);
                runDestructors(destructors);
                return argTypes[0]['fromWireType'](ptr);
            };
            return [];
        });
        return [];
    });
}
function downcastPointer(ptr, ptrClass, desiredClass) {
    if (ptrClass === desiredClass) {
        return ptr;
    }
    if (undefined === desiredClass.baseClass) {
        return null; // no conversion
    }
    // O(depth) stack space used
    return desiredClass.downcast(
        downcastPointer(ptr, ptrClass, desiredClass.baseClass));
}
function upcastPointer(ptr, ptrClass, desiredClass) {
    while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
    }
    return ptr;
}
function validateThis(this_, classType, humanName) {
    if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_);
    }
    if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name);
    }
    if (!this_.$$.ptr) {
        throwBindingError('cannot call emscripten binding method ' + humanName + ' on deleted object');
    }
    // todo: kill this
    return upcastPointer(
        this_.$$.ptr,
        this_.$$.ptrType.registeredClass,
        classType.registeredClass);
}
function __embind_register_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr, // [ReturnType, ThisType, Args...]
    rawInvoker,
    context
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
        var unboundTypesHandler = function() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
        };
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount-2)) {
            // This is the first overload to be registered, OR we are replacing a function in the base class with a function in the derived class.
            unboundTypesHandler.argCount = argCount-2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-2] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
            // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = memberFunction;
            } else {
                proto[methodName].overloadTable[argCount-2] = memberFunction;
            }
            return [];
        });
        return [];
    });
}
function __embind_register_class_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr,
    rawInvoker,
    fn
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
        var unboundTypesHandler = function() {
                throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
            };
        var proto = classType.registeredClass.constructor;
        if (undefined === proto[methodName]) {
            // This is the first function to be registered with this name.
            unboundTypesHandler.argCount = argCount-1;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-1] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            // Replace the initial unbound-types-handler stub with the proper function. If multiple overloads are registered,
            // the function handlers go into an overload table.
            var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
            var func = craftInvokerFunction(humanName, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn);
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = func;
            } else {
                proto[methodName].overloadTable[argCount-1] = func;
            }
            return [];
        });
        return [];
    });
}
function __embind_register_class_property(
    classType,
    fieldName,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    fieldName = readLatin1String(fieldName);
    getter = FUNCTION_TABLE[getter];
    whenDependentTypesAreResolved([], [classType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + fieldName;
        var desc = {
            get: function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            },
            enumerable: true,
            configurable: true
        };
        if (setter) {
            desc.set = function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            };
        } else {
            desc.set = function(v) {
                throwBindingError(humanName + ' is a read-only property');
            };
        }
        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
        whenDependentTypesAreResolved(
            [],
            (setter ? [getterReturnType, setterArgumentType] : [getterReturnType]),
        function(types) {
            var getterReturnType = types[0];
            var desc = {
                get: function() {
                    var ptr = validateThis(this, classType, humanName + ' getter');
                    return getterReturnType['fromWireType'](getter(getterContext, ptr));
                },
                enumerable: true
            };
            if (setter) {
                setter = FUNCTION_TABLE[setter];
                var setterArgumentType = types[1];
                desc.set = function(v) {
                    var ptr = validateThis(this, classType, humanName + ' setter');
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, v));
                    runDestructors(destructors);
                };
            }
            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
            return [];
        });
        return [];
    });
}
var char_0 = '0'.charCodeAt(0);
var char_9 = '9'.charCodeAt(0);
function makeLegalFunctionName(name) {
    name = name.replace(/[^a-zA-Z0-9_]/g, '$');
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return '_' + name;
    } else {
        return name;
    }
}
function __embind_register_smart_ptr(
    rawType,
    rawPointeeType,
    name,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    name = readLatin1String(name);
    rawGetPointee = FUNCTION_TABLE[rawGetPointee];
    rawConstructor = FUNCTION_TABLE[rawConstructor];
    rawShare = FUNCTION_TABLE[rawShare];
    rawDestructor = FUNCTION_TABLE[rawDestructor];
    whenDependentTypesAreResolved([rawType], [rawPointeeType], function(pointeeType) {
        pointeeType = pointeeType[0];
        var registeredPointer = new RegisteredPointer(
            name,
            pointeeType.registeredClass,
            false,
            false,
            // smart pointer properties
            true,
            pointeeType,
            sharingPolicy,
            rawGetPointee,
            rawConstructor,
            rawShare,
            rawDestructor);
        return [registeredPointer];
    });
}
function __embind_register_enum(
    rawType,
    name
) {
    name = readLatin1String(name);
    function constructor() {
    }
    constructor.values = {};
    registerType(rawType, {
        name: name,
        constructor: constructor,
        'fromWireType': function(c) {
            return this.constructor.values[c];
        },
        'toWireType': function(destructors, c) {
            return c.value;
        },
        destructorFunction: null,
    });
    exposePublicSymbol(name, constructor);
}
function __embind_register_enum_value(
    rawEnumType,
    name,
    enumValue
) {
    var enumType = requireRegisteredType(rawEnumType, 'enum');
    name = readLatin1String(name);
    var Enum = enumType.constructor;
    var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(enumType.name + '_' + name, function() {})},
    });
    Enum.values[enumValue] = Value;
    Enum[name] = Value;
}
function __embind_register_constant(name, type, value) {
    name = readLatin1String(name);
    whenDependentTypesAreResolved([], [type], function(type) {
        type = type[0];
        Module[name] = type['fromWireType'](value);
        return [];
    });
}
/*global Module:true, Runtime*/
/*global HEAP32*/
/*global new_*/
/*global createNamedFunction*/
/*global readLatin1String, writeStringToMemory*/
/*global requireRegisteredType, throwBindingError*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */
var Module = Module || {};
var _emval_handle_array = [{}]; // reserve zero
var _emval_free_list = [];
// Public JS API
/** @expose */
Module.count_emval_handles = function() {
    var count = 0;
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            ++count;
        }
    }
    return count;
};
/** @expose */
Module.get_first_emval = function() {
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            return _emval_handle_array[i];
        }
    }
    return null;
};
// Private C++ API
var _emval_symbols = {}; // address -> string
function __emval_register_symbol(address) {
    _emval_symbols[address] = readLatin1String(address);
}
function getStringOrSymbol(address) {
    var symbol = _emval_symbols[address];
    if (symbol === undefined) {
        return readLatin1String(address);
    } else {
        return symbol;
    }
}
function requireHandle(handle) {
    if (!handle) {
        throwBindingError('Cannot use deleted val. handle = ' + handle);
    }
}
function __emval_register(value) {
    var handle = _emval_free_list.length ?
        _emval_free_list.pop() :
        _emval_handle_array.length;
    _emval_handle_array[handle] = {refcount: 1, value: value};
    return handle;
}
function __emval_incref(handle) {
    if (handle) {
        _emval_handle_array[handle].refcount += 1;
    }
}
function __emval_decref(handle) {
    if (handle && 0 === --_emval_handle_array[handle].refcount) {
        _emval_handle_array[handle] = undefined;
        _emval_free_list.push(handle);
    }
}
function __emval_new_array() {
    return __emval_register([]);
}
function __emval_new_object() {
    return __emval_register({});
}
function __emval_undefined() {
    return __emval_register(undefined);
}
function __emval_null() {
    return __emval_register(null);
}
function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v));
}
function __emval_take_value(type, v) {
    type = requireRegisteredType(type, '_emval_take_value');
    v = type['fromWireType'](v);
    return __emval_register(v);
}
var __newers = {}; // arity -> function
function craftEmvalAllocator(argCount) {
    /*This function returns a new function that looks like this:
    function emval_allocator_3(handle, argTypes, arg0Wired, arg1Wired, arg2Wired) {
        var argType0 = requireRegisteredType(HEAP32[(argTypes >> 2)], "parameter 0");
        var arg0 = argType0.fromWireType(arg0Wired);
        var argType1 = requireRegisteredType(HEAP32[(argTypes >> 2) + 1], "parameter 1");
        var arg1 = argType1.fromWireType(arg1Wired);
        var argType2 = requireRegisteredType(HEAP32[(argTypes >> 2) + 2], "parameter 2");
        var arg2 = argType2.fromWireType(arg2Wired);
        var constructor = _emval_handle_array[handle].value;
        var emval = new constructor(arg0, arg1, arg2);
        return emval;
    } */
    var args1 = ["requireRegisteredType", "HEAP32", "_emval_handle_array", "__emval_register"];
    var args2 = [requireRegisteredType, HEAP32, _emval_handle_array, __emval_register];
    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i; // 'arg0, arg1, ..., argn'
        argsListWired += ", arg"+i+"Wired"; // ', arg0Wired, arg1Wired, ..., argnWired'
    }
    var invokerFnBody =
        "return function emval_allocator_"+argCount+"(handle, argTypes " + argsListWired + ") {\n";
    for(var i = 0; i < argCount; ++i) {
        invokerFnBody += 
            "var argType"+i+" = requireRegisteredType(HEAP32[(argTypes >> 2) + "+i+"], \"parameter "+i+"\");\n" +
            "var arg"+i+" = argType"+i+".fromWireType(arg"+i+"Wired);\n";
    }
    invokerFnBody +=
        "var constructor = _emval_handle_array[handle].value;\n" +
        "var obj = new constructor("+argsList+");\n" +
        "return __emval_register(obj);\n" +
        "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __emval_new(handle, argCount, argTypes) {
    requireHandle(handle);
    var newer = __newers[argCount];
    if (!newer) {
        newer = craftEmvalAllocator(argCount);
        __newers[argCount] = newer;
    }
    if (argCount === 0) {
        return newer(handle, argTypes);
    } else if (argCount === 1) {
        return newer(handle, argTypes, arguments[3]);
    } else if (argCount === 2) {
        return newer(handle, argTypes, arguments[3], arguments[4]);
    } else if (argCount === 3) {
        return newer(handle, argTypes, arguments[3], arguments[4], arguments[5]);
    } else if (argCount === 4) {
        return newer(handle, argTypes, arguments[3], arguments[4], arguments[5], arguments[6]);
    } else {
        // This is a slow path! (.apply and .splice are slow), so a few specializations are present above.
        return newer.apply(null, arguments.splice(1));
    }
}
// appease jshint (technically this code uses eval)
var global = (function(){return Function;})()('return this')();
function __emval_get_global(name) {
    name = getStringOrSymbol(name);
    return __emval_register(global[name]);
}
function __emval_get_module_property(name) {
    name = getStringOrSymbol(name);
    return __emval_register(Module[name]);
}
function __emval_get_property(handle, key) {
    requireHandle(handle);
    return __emval_register(_emval_handle_array[handle].value[_emval_handle_array[key].value]);
}
function __emval_set_property(handle, key, value) {
    requireHandle(handle);
    _emval_handle_array[handle].value[_emval_handle_array[key].value] = _emval_handle_array[value].value;
}
function __emval_as(handle, returnType) {
    requireHandle(handle);
    returnType = requireRegisteredType(returnType, 'emval::as');
    var destructors = [];
    // caller owns destructing
    return returnType['toWireType'](destructors, _emval_handle_array[handle].value);
}
function parseParameters(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var argType = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
        a[i] = argType['fromWireType'](argWireTypes[i]);
    }
    return a;
}
function __emval_call(handle, argCount, argTypes) {
    requireHandle(handle);
    var types = lookupTypes(argCount, argTypes);
    var args = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        args[i] = types[i]['fromWireType'](arguments[3 + i]);
    }
    var fn = _emval_handle_array[handle].value;
    var rv = fn.apply(undefined, args);
    return __emval_register(rv);
}
function lookupTypes(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
    }
    return a;
}
function __emval_get_method_caller(argCount, argTypes) {
    var types = lookupTypes(argCount, argTypes);
    var retType = types[0];
    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) { return t.name; }).join("_") + "$";
    var args1 = ["addFunction", "createNamedFunction", "requireHandle", "getStringOrSymbol", "_emval_handle_array", "retType"];
    var args2 = [Runtime.addFunction, createNamedFunction, requireHandle, getStringOrSymbol, _emval_handle_array, retType];
    var argsList = ""; // 'arg0, arg1, arg2, ... , argN'
    var argsListWired = ""; // 'arg0Wired, ..., argNWired'
    for (var i = 0; i < argCount - 1; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += ", arg" + i + "Wired";
        args1.push("argType" + i);
        args2.push(types[1 + i]);
    }
    var invokerFnBody =
        "return addFunction(createNamedFunction('" + signatureName + "', function (handle, name" + argsListWired + ") {\n" +
        "requireHandle(handle);\n" +
        "name = getStringOrSymbol(name);\n";
    for (var i = 0; i < argCount - 1; ++i) {
        invokerFnBody += "var arg" + i + " = argType" + i + ".fromWireType(arg" + i + "Wired);\n";
    }
    invokerFnBody +=
        "var obj = _emval_handle_array[handle].value;\n" +
        "return retType.toWireType(null, obj[name](" + argsList + "));\n" + 
        "}));\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __emval_has_function(handle, name) {
    name = getStringOrSymbol(name);
    return _emval_handle_array[handle].value[name] instanceof Function;
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
//@ sourceMappingURL=quick_example.js.map