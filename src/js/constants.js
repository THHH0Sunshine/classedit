export const CP_TAG_NAME = [
  null,
  'Utf-8',
  null,
  'Integer',
  'Float',
  'Long',
  'Double',
  'Class',
  'String',
  'Fieldref',
  'Methodref',
  'InterfaceMethodref',
  'NameAndType',
  null,
  null,
  'MethodHandle',
  'MethodType',
  null,
  'InvokeDynamic',
]

export const ACCESS_FLAG = [
  //class
  [
    'public',        null,         null,       null,
    'final',         'ACC_SUPER',  null,       null,
    null,            'interface',  'abstract', null,
    'ACC_SYNTHETIC', 'annotation', 'enum',     null,
  ],
  //field
  [
    'public',        'private', 'protected', 'static',
    'final',         null,      'volatile',  'transient',
    null,            null,      null,        null,
    'ACC_SYNTHETIC', null,      'enum',      null,
  ],
  //method
  [
    'public',        'private',      'protected',  'static',
    'final',         'synchronized', 'ACC_BRIDGE', 'ACC_VARARGS',
    'native',        null,           'abstract',   'strictfp',
    'ACC_SYNTHETIC', null,           null,         null,
  ],
]

const _BASIC_TYPE_IDENTIFIER = {
  'B': 'byte',
  'C': 'char',
  'D': 'double',
  'F': 'float',
  'I': 'int',
  'J': 'long',
  'S': 'short',
  'Z': 'boolean',
  'V': 'void',
}

function _getRightIndex(str, startind) {
  let count = 1
  while (startind < str.length) {
    let c = str.charAt(startind)
    if (c == '<')
      count++
    else if (c == '>') {
      if (!--count)
        return startind
    }
    startind++
  }
  return -1
}

function _translateGenericType(str, startind) {
  if (str[startind] == '+') {
    return '<? extends ' + TRANSLATE_TYPE(str.substring(startind + 1)).value + '>'
  }
  if (str[startind] == '-') {
    return '<? super ' + TRANSLATE_TYPE(str.substring(startind + 1)).value + '>'
  }
  return '<' + TRANSLATE_TYPE(str.substring(startind)).value + '>'
}

function _translateGenericList(str, startind, endind) {
  let list = []
  while (startind < endind) {
    let cind = str.indexOf(':', startind)
    if (cind <= 0 || cind >= endind) return null
    let type = TRANSLATE_TYPE(str.substring(cind + 1))
    list.push(str.substring(startind, cind) + ' extends ' + type.value)
    startind = cind + 1 + type.len
  }
  return '<' + list.join(', ') + '>'
}

export function TRANSLATE_TYPE(str) {
  let rt = {}
  let ch = str.charAt(0)
  let s = _BASIC_TYPE_IDENTIFIER[ch]
  if (s) {
    rt.value = s
    rt.len = 1
  } else {
    switch (ch) {
      case 'L': {
        let ltind = str.indexOf('<')
        let scind = str.indexOf(';')
        if (ltind > 0 && ltind < scind) {
          let startind = ltind + 1
          let endind = _getRightIndex(str, startind)
          if (endind < 0) {
            rt.len = str.length
            return rt
          }
          let gen = _translateGenericType(str, startind)
          if (!gen) {
            rt.len = str.length
            return rt
          }
          rt.value = str.substring(1, ltind).replace(/\//g, '.') + gen
          rt.len = endind + 2
        } else {
          rt.value = str.substring(1, scind).replace(/\//g, '.')
          rt.len = scind + 1
        }
        break
      }
      case 'T': {
        let scind = str.indexOf(';')
        rt.value = str.substring(1, scind).replace(/\//g, '.')
        rt.len = scind + 1
        break
      }
      case '[': {
        let itm = TRANSLATE_TYPE(str.substring(1))
        rt.value = itm.value + '[]'
        rt.len = itm.len + 1
        break
      }
      case '(': {
        rt.len = str.length
        let startind = 1
        let endind = str.indexOf(')')
        if (endind < 0)
          return rt
        let sa = []
        while (startind < endind) {
          let arg = TRANSLATE_TYPE(str.substring(startind))
          sa.push(arg.value)
          startind += arg.len
        }
        rt.args = '(' + sa.join(', ') + ')'
        rt.value = TRANSLATE_TYPE(str.substring(endind + 1)).value
        break
      }
      case '<': {
        rt.len = str.length
        let eind = _getRightIndex(str, 1)
        if (eind < 0)
          return rt
        let gen = _translateGenericList(str, 1, eind)
        if (!gen)
          return rt
        let it = TRANSLATE_TYPE(str.substring(eind + 1))
        rt.args = it.args
        rt.value = it.value
        rt.fgen = gen
        break
      }
      default:
        rt.len = str.length
    }
  }
  return rt
}

export const BYTECODE = [
  'nop', 'aconst_null', 'iconst_m1', 'iconst_0',
  'iconst_1', 'iconst_2', 'iconst_3', 'iconst_4',
  'iconst_5', 'lconst_0', 'lconst_1', 'fconst_0',
  'fconst_1', 'fconst_2', 'dconst_0', 'dconst_1',
  '1 bipush', '2 sipush', '1 ldc', '2 ldc_w',
  '2 ldc2_w', '1 iload', '1 lload', '1 fload',
  '1 dload', '1 aload', 'iload_0', 'iload_1',
  'iload_2', 'iload_3', 'lload_0', 'lload_1',
  'lload_2', 'lload_3', 'fload_0', 'fload_1',
  'fload_2', 'fload_3', 'dload_0', 'dload_1',
  'dload_2', 'dload_3', 'aload_0', 'aload_1',
  'aload_2', 'aload_3', 'iaload', 'laload',
  'faload', 'daload', 'aaload', 'baload',
  'caload', 'saload', '1 istore', '1 lstore',
  '1 fstore', '1 dstore', '1 astore', 'istore_0',
  'istore_1', 'istore_2', 'istore_3', 'lstore_0',
  'lstore_1', 'lstore_2', 'lstore_3', 'fstore_0',
  'fstore_1', 'fstore_2', 'fstore_3', 'dstore_0',
  'dstore_1', 'dstore_2', 'dstore_3', 'astore_0',
  'astore_1', 'astore_2', 'astore_3', 'iastore',
  'lastore', 'fastore', 'dastore', 'aastore',
  'bastore', 'castore', 'sastore', 'pop',
  'pop2', 'dup', 'dup_x1', 'dup_x2',
  'dup2', 'dup2_x1', 'dup2_x2', 'swap',
  'iadd', 'ladd', 'fadd', 'dadd',
  'isub', 'lsub', 'fsub', 'dsub',
  'imul', 'lmul', 'fmul', 'dmul',
  'idiv', 'ldiv', 'fdiv', 'ddiv',
  'irem', 'lrem', 'frem', 'drem',
  'ineg', 'lneg', 'fneg', 'dneg',
  'ishl', 'lshl', 'ishr', 'lshr',
  'iushr', 'lushr', 'iand', 'land',
  'ior', 'lor', 'ixor', 'lxor',
  '2 iinc', 'i2l', 'i2f', 'i2d',
  'l2i', 'l2f', 'l2d', 'f2i',
  'f2l', 'f2d', 'd2i', 'd2l',
  'd2f', 'i2b', 'i2c', 'i2s',
  'lcmp', 'fcpml', 'fcmpg', 'dcmpl',
  'dcmpg', '2 ifeq', '2 ifne', '2 iflt',
  '2 ifge', '2 ifgt', '2 ifle', '2 if_icmpeq',
  '2 if_icmpne', '2 if_icmplt', '2 if_icmpge', '2 if_icmpgt',
  '2 if_icmple', '2 if_acmpeq', '2 if_acmpne', '2 goto',
  '4 jsr', '1 ret', null/*'tableswitch'*/, null/*'lookupswitch'*/,
  'ireturn', 'lreturn', 'freturn', 'dreturn',
  'areturn', 'return', '2 getstatic', '2 putstatic',
  '2 getfield', '2 putfield', '2 invokevirtual', '2 invokespecial',
  '2 invokestatic', '4 invokeinterface', null, '2 new',
  '1 newarray', '2 anewarray', 'arraylength', 'athrow',
  '2 checkcast', '2 instanceof', 'monitorenter', 'monitorexit',
  'wide', '3 multianewarray', '2 ifnull', '2 ifnonnull',
  '4 goto_w', '4 jsr_w'
]
