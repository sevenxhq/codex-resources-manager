// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ExtensionProvider } from "./providers/extensionProvider";
import { TWLResource } from "./providers/TWLResource/provider";
import { ResourcesProvider } from "./providers/resourceTable/provider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "codex-resources" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  const extensionProvider = new ExtensionProvider();
  extensionProvider.registerResource(new TWLResource());

  console.log(
    'Congratulations, your extension "codex" is now active!, registered resources:'
  );

  console.log(ExtensionProvider.registeredResources);

  vscode.window.showInformationMessage("Hello World! It's working hahahhah");

  let disposable = vscode.commands.registerCommand(
    "codex-resources.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from codex resources!");
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(ResourcesProvider.register(context));

  return extensionProvider;
}

// This method is called when your extension is deactivated
export function deactivate() {}
