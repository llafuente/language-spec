# Tokens

```syntax
// Type system

TYPE_TK : 'type';
STRUCT_TK : 'struct';
ENUM_TK : 'enum';
MASK_TK : 'mask';
EXTENDS_TK : 'extends';
INTERFACE_TK : 'interface';
IS_TK : 'is';

// constants
TRUE_TK : 'true';
FALSE_TK : 'false';
NULL_TK : 'null';

// primitives

I8_TK : 'i8';
I16_TK : 'i16';
I32_TK : 'i32';
I64_TK : 'i64';
U8_TK : 'u8';
U16_TK : 'u16';
U32_TK : 'u32';
U64_TK : 'u64';
F32_TK : 'f32';
F64_TK : 'f64';
FLOAT_TK : 'float';
INT_TK : 'int';
SIZE_TK : 'size';
BOOL_TK : 'bool';
PTRDIFF_TK : 'ptrdiff';
ADDRESS_TK : 'address';
VOID_TK : 'void';
HOIST_TK : 'hoist';
READONLY_TK : 'readonly';


// variables

VAR_TK : 'var';
CONST_TK : 'const';
GLOBAL_TK : 'global';
PACKAGE_TK : 'package';

// functions

FUNCTION_TK : 'function';
PURE_TK : 'pure';
OPERATOR_TK : 'operator';
RETURN_TK : 'return';
ALIAS_TK : 'alias';
GET_TK : 'get';
SET_TK : 'set';
AUTOCAST_TK : 'autocast';
DEFER_TK : 'defer';

// Control flow

IF_TK : 'if';
ELSE_TK : 'else';
SWITCH_TK : 'switch';
CASE_TK : 'case';
FALLTHROUGH_TK : 'fallthrough';
GOTO_TK : 'goto';
LOOP_TK : 'loop';
FOREACH_TK : 'foreach';
FOR_TK : 'for';
DO_TK : 'do';
WHILE_TK : 'while';
CONTINUE_TK : 'continue';
RESTART_TK : 'restart';
BREAK_TK : 'break';
IN_TK : 'in';
DEFAULT_TK : 'default';

// memory
CLONE_TK : 'clone';
NEW_TK : 'new';
DELETE_TK : 'delete';
LEND_TK : 'lend';
OWN_TK : 'own';
UNINITIALIZED_TK : 'uninitialized';
AT_TK : 'at';
CAST_TK : 'cast';

// Preprocessor

HASH_TK : '#';

// Expressions
LEFTPAREN_TK : '(';
RIGHTPAREN_TK : ')';
SELFLEFTBRACKET_TK : '![';
SAFELEFTBRACKET_TK : '?[';
LEFTBRACKET_TK : '[';
RIGHTBRACKET_TK : ']';
LEFTBRACE_TK : '{';
RIGHTBRACE_TK : '}';

// todo add operators!
DOLLAR_TK : '$';
COMMA_TK : ',';
GT_TK : '>';
LT_TK : '<';
EQUALEQUAL_TK : '==';
EQUAL_TK : '=';
PIPE_TK : '|';
QUESTION_TK : '?';
PLUSPLUS_TK : '++';
PLUS_TK : '+';
MINUSMINUS_TK : '--';
MINUS_TK : '-';
COLON_TK : ':';



QUESTIONDOT_TK : '?.';
NOTDOT_TK : '!.';
DOT_TK : '.';
AND_TK : '&';
STAR_TK : '*';
TILDE_TK : '~';
NOT_TK : '!';
SLASH_TK : '/';
MOD_TK : '%';
LEFT_SHIFT_TK : '<<';
RIGHT_SHIFT_TK : '>>';
LESS_EQUAL_TK : '<=';
GREATER_EQUAL_TK : '>=';
NOT_EQUAL_TK : '!=';
CARET_TK : '^';
ANDAND_TK : '&&';
OROR_TK : '||';
STAR_ASSIGN_TK : '*=';
DIV_ASSIGN_TK : '/=';
MOD_ADDIGN_TK : '%=';
PLUS_ASSIGN_TK : '+=';
MINUS_ASSIGN_TK : '-=';
LEFT_SHIFT_ASSIGN_TK : '<<=';
RIGHT_SHIFT_ASSIGN_TK : '>>=';
AND_ASSIGN_TK : '&=';
XOR_ASSIGN_TK : '^=';
OR_ASSIGN_TK : '|=';


// WS : [ \t\f]+                        -> channel(HIDDEN);
WS : [ \t\f]+                        -> skip;
WHITESPACE: ' ' -> skip;

NEWLINE_TK :   ('\r' '\n'? | '\n');
SEMICOLON_TK : ';';


// ?? -> channel(HIDDEN);
SINGLE_LINE_COMMENT : '//' ~[\r\n]*;
BLOCK_COMMENT : '/*' .*? '*/';

```
