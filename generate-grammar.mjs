import { openSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn }  from 'node:child_process';

//var list = readDirSync(".");

function parseLexer(fileContents) {
	return fileContents.filter((line) => {
		return line.indexOf("lexer\n") == 0
	}).map((line) => {
		return line.substr("lexer\n".length)
	}).join("\n");
}

function parseSyntax(fileContents) {
	return fileContents.filter((line) => {
		return line.indexOf("syntax\n") == 0
	}).map((line) => {
		return line.substr("syntax\n".length)
	}).join("\n");
}

function replaceTokens(tokens, contents) {
	for (const tk of tokens) {
		contents = contents.replace(tk[0], tk[1]);
	}
	return contents
}

var lexer = [];
// lexer
[
	"./spec/language/tokens.md",
	"./spec/language/identifiers.md",
	"./spec/language/literals.md",
].forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	lexer.push(`//file: ${file}`)
	lexer.push(parseLexer(contents))
});
writeFileSync("./LanguageLexer.g4", `lexer grammar LanguageLexer;\n` + lexer.join("\n"))

var tokens = [];

lexer.forEach((chunk) => {
	chunk.split("\n").filter((line) => {
		return line.indexOf(" : ") > 0 && line.indexOf(";") > 0
	}).forEach((line) => {
		var parts = line.split(" : ")
		tokens.push([parts[1].substr(0, parts[1].length - 1), parts[0]])
	});
});

console.log("TOKENS!");
console.log(tokens);

var parser = [];
[
	"./spec/language/program.md",
	"./spec/language/identifiers.md",
	"./spec/language/literals.md",
	"./spec/language/type-system.md",
	"./spec/language/functions.md",
	"./spec/memory-management.md",
	"./spec/language/expressions.md",
	// "./spec/generic-programming.md",
	// "./spec/preprocessor-and-metaprogramming.md",
	// "./spec/compiler/compiler-configuration.md",
	"./spec/language/control-flow.md",
	"./spec/language/variables.md",
	"./spec/language/types/array.md",
	// "./spec/language/types/enumerated.md",
].forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	parser.push(`//file: ${file}`)
	parser.push(replaceTokens(tokens, parseSyntax(contents)))

	// search for tokens and replace them!
});

writeFileSync("./LanguageParser.g4", `parser grammar LanguageParser;
// options { tokenVocab=LanguageLexer; }
` + parser.join("\n"))


// < core\os\process.language

let fd_stdin = openSync('./tests/syntax-smoke-screen.language', 'r');
// var fd_stdin = openSync('./tests/syntax/struct-initializer.language', 'r');
// tokenizer debug
// let antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'program', '-tokens'], {
// parser debug
let antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'program', '-gui'], {
  stdio: [fd_stdin, 1, 2]
});

/*
//let fd_stdin = openSync('./core/process.language', 'r');
//let fd_stdin = openSync('./core/os.language', 'r');
//let fd_stdin = openSync('./core/index_iterator.language', 'r');
let fd_stdin = openSync('./core/types/allocator.language', 'r');
let antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'packageProgram', '-gui'], {
  stdio: [fd_stdin, 1, 2]
});

*/