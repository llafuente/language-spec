import { openSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn }  from 'node:child_process';

//var list = readDirSync(".");

function parseSyntax(fileContents) {
	return fileContents.filter((line) => {
		return line.indexOf("syntax\n") == 0
	}).map((line) => {
		return line.substr("syntax\n".length)
	}).join("\n");
}

var lexer = [];
// lexer
["./language\\tokens.md"].forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	lexer.push(`//file: ${file}`)
	lexer.push(parseSyntax(contents))
});
writeFileSync("./LanguageLexer.g4", `lexer grammar LanguageLexer;\n` + lexer.join("\n"))

var parser = [];
[
	"./generic-programming.md",
	"./memory-management.md",
	"./preprocessor-and-metaprogramming.md",
	"./compiler\\compiler-configuration.md",
	"./language\\control-flow.md",
	"./language\\expressions.md",
	"./language\\functions.md",
	"./language\\identifiers.md",
	"./language\\literals.md",
	"./language\\program.md",
	"./language\\type-system.md",
	"./language\\variables.md",
	"./language\\types\\array.md",
].forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	parser.push(`//file: ${file}`)
	parser.push(parseSyntax(contents))
});

writeFileSync("./LanguageParser.g4", `grammar LanguageParser;
// options { tokenVocab=LanguageLexer; }
` + parser.join("\n"))


// < core\os\process.language
var fd_stdin = openSync('./language.language', 'r');
const antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'program', '-gui'], {
  stdio: [fd_stdin, 1, 2]
});