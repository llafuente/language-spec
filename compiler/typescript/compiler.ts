import LanguageLexer from "./LanguageLexer.ts"
import LanguageParser, { ProgramContext } from "./LanguageParser.ts"
import LanguageParserListener from "./LanguageParserListener.ts"
import { InputStream, CommonTokenStream, ParseTreeWalker, RecognitionException, Parser, ErrorListener, Recognizer, ParseTree } from "antlr4";

// https://github.com/ApsarasX/llvm-bindings/tree/master

const inputFile = Deno.args[0]
const isPackage: boolean = Deno.args[1] == "-package"
const input = Deno.readTextFileSync(inputFile);
//const input = 'this is an invalid program!'

/*
const input = `
function main() {
    return 1 + 1 
}

*/


// Function to recursively print the AST
function printAST(tree: ParseTree, indent: string = ""): void {
    // Print the current node
    console.log(`${indent}${tree.constructor.name}: ${tree.getText()}`);

    // Recursively print child nodes
    for (let i = 0; i < tree.getChildCount(); i++) {
        const child = tree.getChild(i);
        printAST(child, indent + "  ");
    }
}


class ExprErrorListener extends ErrorListener {
  override syntaxError(recognizer: Recognizer<Symbol>, offendingSymbol: Symbol, line: number, column: number, msg: string, e: RecognitionException | undefined): void {
    //console.log(recognizer);
    //console.log(offendingSymbol);
    //console.log(line);
    //console.log(column);
    //console.log(Object.keys(e));
    //console.log(Object.keys(e.input));
    //console.log(recognizer.state)
    //console.log(offendingSymbol.toString())
    //console.log(e?.ctx.getText());
    //console.log("??")
    
    //const lines = input.split(/(\r\n|\n/)/);
    const lines = input.split("\n");
    
    console.log(msg, "\n");
    
    const start = Math.max(0, line - 5)
    console.log(lines.slice(start, line).join("\n"))

    console.log(Array(column).fill("-").join("") + "^\x1B[31m", msg, "\x1B[39m")
    console.log(lines.slice(line, line + 5).join("\n"))

    console.log(`${inputFile}:${line}:${column}`);

    //console.log(recognizer.getLiteralNames())
    //console.log(recognizer.getSymbolicNames())
    console.log(offendingSymbol.toString())
    

    process.exit(1)
  }
}

// console.log(input)
const chars = new InputStream(input + "\n");
const lexer = new LanguageLexer(chars);
const tokens = new CommonTokenStream(lexer);
// console.log(tokens)
const parser = new LanguageParser(tokens);
parser.removeErrorListeners();
parser.addErrorListener(new ExprErrorListener());
parser.buildParseTrees = true;


/**
 * We set the root node of the tree as a chat rule. 
 * You want to invoke the parser specifying a rule which typically is the first rule. 
 * However you can actually invoke any rule directly.
 */

const tree = (isPackage) ? parser.packageProgram() : parser.program();

ParseTreeWalker.DEFAULT.walk(new LanguageParserListener(), tree);