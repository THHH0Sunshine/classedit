function getStringFromUtf8(a) {
  return decodeURIComponent(escape(String.fromCharCode.apply(null, a)))
}
/*
function getUtf8FromString(s) {
  var bs = unescape(encodeURIComponent(s))
  var rt = new Array(bs.length)
  for (var i = 0; i < bs.length; i++)
    rt[i] = bs.charCodeAt(i)
  return rt
}
*/
function ArrayBufferReader(ab) {
  this.view = new DataView(ab)
  this.offset = 0
}

ArrayBufferReader.prototype.nextu1 = function() {
  var rt = this.view.getUint8(this.offset)
  this.offset += 1
  return rt
}

ArrayBufferReader.prototype.nextu2 = function() {
  var rt = this.view.getUint16(this.offset)
  this.offset += 2
  return rt
}

ArrayBufferReader.prototype.nextu4 = function() {
  var rt = this.view.getUint32(this.offset)
  this.offset += 4
  return rt
}

ArrayBufferReader.prototype.nextByte = function() {
  var rt = this.view.getInt8(this.offset)
  this.offset += 1
  return rt
}

ArrayBufferReader.prototype.nextShort = function() {
  var rt = this.view.getInt16(this.offset)
  this.offset += 2
  return rt
}

ArrayBufferReader.prototype.nextInteger = function() {
  var rt = this.view.getInt32(this.offset)
  this.offset += 4
  return rt
}

ArrayBufferReader.prototype.nextLong = function() {
  var rt = {}
  rt.h = this.view.getUint32(this.offset)
  rt.l = this.view.getUint32(this.offset + 4)
  this.offset += 8
  return rt
}

ArrayBufferReader.prototype.nextFloat = function() {
  var rt = this.view.getFloat32(this.offset)
  this.offset += 4
  return rt
}

ArrayBufferReader.prototype.nextDouble = function() {
  var rt = this.view.getFloat64(this.offset)
  this.offset += 8
  return rt
}

ArrayBufferReader.prototype.nextUtf8 = function(len) {
  var arr = new Array(len)
  for (var i = 0; i < len; i++)
    arr[i] = this.view.getUint8(this.offset + i)
  this.offset += len
  return getStringFromUtf8(arr)
}

function parseAttribute(cp, abreader) {
  var rt = {}
  rt.attribute_name_index = abreader.nextu2()
  rt.attribute_length = abreader.nextu4()
  var endoffset = abreader.offset + rt.attribute_length
  switch (cp[rt.attribute_name_index].utf8_) {
    case 'Code':
      rt.max_stack = abreader.nextu2()
      rt.max_locals = abreader.nextu2()
      var len = abreader.nextu4()
      rt.code_ = new Array(len)
      for (var i = 0; i < len; i++)
        rt.code_[i] = abreader.nextu1()
      len = abreader.nextu2()
      rt.exception_table = new Array(len)
      for (var i = 0; i < len; i++) {
        var obj = {}
        rt.exception_table[i] = obj
        obj.start_pc = abreader.nextu2()
        obj.end_pc = abreader.nextu2()
        obj.handler_pc = abreader.nextu2()
        obj.catch_type_index = abreader.nextu2()
      }
      len = abreader.nextu2()
      rt.attributes_ = new Array(len)
      for (var i = 0; i < len; i++)
        rt.attributes_[i] = parseAttribute(cp, abreader)
      break
    case 'ConstantValue':
      rt.constantvalue_index = abreader.nextu2()
      break
    case 'Exceptions':
      var len = abreader.nextu2()
      rt.exception_index_table = new Array(len)
      for (var i = 0; i < len; i++)
        rt.exception_index_table[i] = abreader.nextu2()
      break
    case 'InnerClasses':
      var len = abreader.nextu2()
      rt.inner_classes = new Array(len)
      for (var i = 0; i < len; i++) {
        var obj = {}
        rt.inner_classes[i] = obj
        obj.inner_class_info_index = abreader.nextu2()
        obj.outer_class_info_index = abreader.nextu2()
        obj.inner_name_index = abreader.nextu2()
        obj.inner_name_access_flags = abreader.nextu2()
      }
      break
    case 'LineNumberTable':
      var len = abreader.nextu2()
      rt.line_number_table = new Array(len)
      for (var i = 0; i < len; i++) {
        var obj = {}
        rt.line_number_table[i] = obj
        obj.start_pc = abreader.nextu2()
        obj.line_number = abreader.nextu2()
      }
      break
    case 'LocalVariableTable':
      var len = abreader.nextu2()
      rt.local_variable_table = new Array(len)
      for (var i = 0; i < len; i++) {
        var obj = {}
        rt.local_variable_table[i] = obj
        obj.start_pc = abreader.nextu2()
        obj.length_ = abreader.nextu2()
        obj.name_index = abreader.nextu2()
        obj.descriptor_index = abreader.nextu2()
        obj.index_ = abreader.nextu2()
      }
      break
    case 'Signature':
      rt.signature_index = abreader.nextu2()
      break
    case 'SourceFile':
      rt.sourcefile_index = abreader.nextu2()
      break
  }
  abreader.offset = endoffset
  return rt
}

export function parseClassFileArrayBuffer(ab) {
  try {
    var reader = new ArrayBufferReader(ab)
    if (reader.nextu4() != 0xCAFEBABE)
      return null
    var rt = {}
    //version
    rt.minor_version = reader.nextu2()
    rt.major_version = reader.nextu2()
    //constant pool
    var length = reader.nextu2()
    rt.constant_pool = new Array(length)
    for (var index = 1; index < length; index++) {
      var obj = {}
      rt.constant_pool[index] = obj
      obj.tag_ = reader.nextu1()
      switch (obj.tag_) {
        case 1:
          obj.utf8_ = reader.nextUtf8(reader.nextu2())
          break
        case 3:
          obj.integer_ = reader.nextInteger()
          break
        case 4:
          obj.float_ = reader.nextFloat()
          break
        case 5:
          obj.long_ = reader.nextLong()
          index++
          break
        case 6:
          obj.double_ = reader.nextDouble()
          index++
          break
        case 7:
          obj.name_index = reader.nextu2()
          break
        case 8:
          obj.string_index = reader.nextu2()
          break
        case 9:
        case 10:
        case 11:
          obj.class_index = reader.nextu2()
          obj.name_and_type_index = reader.nextu2()
          break
        case 12:
          obj.name_index = reader.nextu2()
          obj.type_index = reader.nextu2()
          break
        case 15:
          obj.reference_kind = reader.nextu1()
          obj.reference_index = reader.nextu2()
          break
        case 16:
          obj.descriptor_index = reader.nextu2()
          break
        case 18:
          obj.bootstrap_method_attr_index = reader.nextu2()
          obj.name_and_type_index = reader.nextu2()
          break
        default:
          console.log(obj.tag_) //debug
          console.log(rt) //debug
          return null
      }
    }
    //class
    rt.access_flags = reader.nextu2()
    rt.this_class_index = reader.nextu2()
    rt.super_class_index = reader.nextu2()
    length = reader.nextu2()
    rt.interfaces_ = new Array(length)
    for (var index = 0; index < length; index++)
      rt.interfaces_[index] = reader.nextu2()
    //fields
    length = reader.nextu2()
    rt.fields_ = new Array(length)
    for (var index = 0; index < length; index++) {
      var obj = {}
      rt.fields_[index] = obj
      obj.access_flags = reader.nextu2()
      obj.name_index = reader.nextu2()
      obj.signature_index = reader.nextu2()
      var len = reader.nextu2()
      obj.attributes_ = new Array(len)
      for (var i = 0; i < len; i++)
        obj.attributes_[i] = parseAttribute(rt.constant_pool, reader)
    }
    //methods
    length = reader.nextu2()
    rt.methods_ = new Array(length)
    for (var index = 0; index < length; index++) {
      var obj = {}
      rt.methods_[index] = obj
      obj.access_flags = reader.nextu2()
      obj.name_index = reader.nextu2()
      obj.signature_index = reader.nextu2()
      var len = reader.nextu2()
      obj.attributes_ = new Array(len)
      for (var i = 0; i < len; i++)
        obj.attributes_[i] = parseAttribute(rt.constant_pool, reader)
    }
    return rt
  } catch (e) {
    console.log(e) //debug
    console.log(rt) //debug
    return null
  }
}
