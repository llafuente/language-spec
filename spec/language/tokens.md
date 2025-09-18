# Tokens

*syntax*

```lexer
// Type system

TYPE_TK : 'type';
STRUCT_TK : 'struct';
NOALIGN_TK : 'noalign';
LEAN_TK : 'lean';
ENUM_TK : 'enum';
MASK_TK : 'mask';
EXTENDS_TK : 'extends';
IMPLEMENTS_TK : 'implements';
INTERFACE_TK : 'interface';
IS_TK : 'is';
ANY_TK : 'any';
SELF_TK : 'self';
HOIST_TK : 'hoist';
READONLY_TK : 'readonly';
INSTANCEOF_TK : 'instanceof';
STATIC_TK : 'static';

// constants
TRUE_TK : 'true';
FALSE_TK : 'false';
NULL_TK : 'null';



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
OUT_TK : 'out';
OVERRIDE_TK : 'override';
OVERWRITE_TK : 'overwrite';

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
UNTIL_TK : 'until';
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

// error handling
TRY_TK : 'try';
RETRY_TK : 'retry';
CATCH_TK : 'catch';
FINALLY_TK : 'finally';
THROW_TK : 'throw';


//metaprogramming

META_MACRO_TK : '#macro';
META_REPEAT_TK : '#repeat';
META_MACRO_BLOCK_TK : '#block';
META_DEFINE_TK : '#define';
META_TEXT_TK : '#text';
META_STRING_TK : '#string';
META_EXPR_TK : '#expression';
META_VALUE_TK : '#value';
META_FORARGS_TK : '#forargs';
META_FORSTRUCT_TK : '#forstruct';
META_EXEC_TK : '#exec';
META_ASSERT_TK : '#assert';
META_UID_TK : '#uid';
META_ERROR_TK : '#error';
META_WARNING_TK : '#warning';
META_TYPE_ERROR_TK : '#type_error';
META_SEMANTIC_ERROR_TK : '#semantic_error';

// Preprocessor

DOUBLE_HASH_TK : '##';
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
EQUALEQUALEQUAL_TK : '===';
EQUALEQUAL_TK : '==';
ALMOSTEQUAL_TK : '~=';
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
AT_CHAR_TK : '@';
STAR_TK : '*';
TILDE_TK : '~';
NOT_TK : '!';
NOT2_TK : 'not';
SLASH_TK : '/';
MOD_TK : '%';
// LEFT_SHIFT_TK : '<<';
// RIGHT_SHIFT_TK : '>>';
LESS_EQUAL_TK : '<=';
GREATER_EQUAL_TK : '>=';
NOT_EQUALEQUAL_TK : '!==';
NOT_EQUAL_TK : '!=';
CARET_TK : '^';
ANDAND_TK : '&&';
ANDAND2_TK : 'and';
OROR_TK : '||';
OROR2_TK : 'or';
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
