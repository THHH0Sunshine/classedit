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

export function TRANSLATE_TYPE(str) {
  let rt = {
    value: '',
    args: '',
    len: 0,
  }
  let ch = str.charAt(0)
  let s = _BASIC_TYPE_IDENTIFIER[ch]
  if (s) {
    rt.value = s
    rt.len = 1
  } else {
    switch (ch) {
      case 'L':
        let scind = str.indexOf(';')
        rt.value = str.substring(1, scind).replace(/\//g, '.')
        rt.len = scind + 1
        break
      case '[':
        let itm = TRANSLATE_TYPE(str.substring(1))
        rt.value = itm.value + '[]'
        rt.len = itm.len + 1
        break
      case '(':
        let startind = 1
        let endind = str.indexOf(')')
        let sa = []
        while (startind < endind) {
          let arg = TRANSLATE_TYPE(str.substring(startind))
          sa.push(arg.value)
          startind += arg.len
        }
        rt.args = '(' + sa.join(',') + ')'
        rt.value = TRANSLATE_TYPE(str.substring(endind + 1)).value
        break
    }
  }
  return rt
}