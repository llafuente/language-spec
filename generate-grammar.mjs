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

function replaceTokens(tokens, contents) {
	for (const tk of tokens) {
		contents = contents.replace(tk[0], tk[1]);
	}
	return contents
}

var lexer = [];
// lexer
[
	"./language\\tokens.md",
	"./language\\identifiers.md",
	"./language\\literals.md",
].forEach((file) => {
	var contents = readFileSync(file, {encoding: "utf-8"})
	contents = contents.split("```");
	lexer.push(`//file: ${file}`)
	lexer.push(parseSyntax(contents))
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
	"./language\\program.md",
	"./language\\type-system.md",
	"./language\\functions.md",
	"./memory-management.md",
	"./language\\expressions.md",
	// "./generic-programming.md",
	// "./preprocessor-and-metaprogramming.md",
	// "./compiler\\compiler-configuration.md",
	"./language\\control-flow.md",
	// "./language\\variables.md",
	// "./language\\types\\array.md",
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
var fd_stdin = openSync('./language.language', 'r');
const antlr4 = spawn('antlr4-parse', ['LanguageParser.g4', 'LanguageLexer.g4', 'program', '-gui'], {
  stdio: [fd_stdin, 1, 2]
});