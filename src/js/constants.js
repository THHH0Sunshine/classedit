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

function _translateGenericType(str, startind, endind) {
  //
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
      case 'L':
      case 'T':
        let ltind = str.indexOf('<')
        let scind = str.indexOf(';')
        if (ltind > 0 && ltind < scind) {
          let startind = ltind + 1
          let endind = _getRightIndex(str, startind)
          if (endind < 0) {
            rt.len = str.length
            return rt
          }
          let gen = _translateGenericType(str, startind, endind)
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
      case '[':
        let itm = TRANSLATE_TYPE(str.substring(1))
        rt.value = itm.value + '[]'
        rt.len = itm.len + 1
        break
      case '(':
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
      case '<':
        rt.len = str.length
        let eind = _getRightIndex(str, 1)
        if (eind < 0)
          return rt
        let gen = _translateGenericType(str, 1, eind)
        if (!gen)
          return rt
        let it = TRANSLATE_TYPE(str.substring(eind + 1))
        rt.args = it.args
        rt.value = it.value
        rt.fgen = gen
        break
      default:
        rt.len = str.length
    }
  }
  return rt
}