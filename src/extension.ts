import * as vscode from "vscode";
import { ExtensionProvider } from "./providers/extensionProvider";
import { TWLResource } from "./providers/TWLResource/provider";
import { ResourcesProvider } from "./providers/resourceTable/provider";
import { TnResource } from "./builtinResources/TranslationNotes/provider";

export function activate(context: vscode.ExtensionContext) {
  const extensionProvider = new ExtensionProvider();
  let disposable = vscode.commands.registerCommand(
    "codex-resources.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from codex resources!");
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(ResourcesProvider.register(context));
  extensionProvider.registerResource(new TWLResource());
  extensionProvider.registerResource(new TnResource());
  return extensionProvider;
}
export function deactivate() {}
