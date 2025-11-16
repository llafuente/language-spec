function integers() {
  const decimal_int = 98222
  const hex_int = 0xff
  const another_hex_int = 0xFF
  const octal_int = 0o755
  const binary_int = 0b11110000
  const one_billion = 1_000_000_000
  const binary_mask = 0b1_1111_1111
  const permissions = 0o7_5_5
  const big_address = 0xFF80_0000_0000_0000
}

function floating() {
  const floating_point = 123.0E+77
  const another_float = 123.0
  const yet_another = 123.0e+77
  //const hex_floating_point = 0x103.70p-5
  //const another_hex_float = 0x103.70
  //const yet_another_hex_float = 0x103.70P-5
  const lightspeed = 299_792_458.000_000
  const nanosecond = 0.000_000_001
  //const more_hex = 0x1234_5678.9ABC_CDEFp-10
}


function string() {
  var s = "hello world!"
  var s = "hello world!" + "john"
}

function array() {
  var a1 = []
  var a2 = [1, 2, 3]
  var a3 = [a(), b(), c()]
  var a4 = [1 + 1, 3 * 7]
  var i8[] a5 = new(10)
}

function struct_init() {
  var l1 = true
  var l2 = false
  var l3 = null
}
