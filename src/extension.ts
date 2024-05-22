import * as vscode from "vscode";
import { ExtensionProvider } from "./providers/extensionProvider";
import { TWLResource } from "./providers/TWLResource/provider";
import { ResourcesProvider } from "./providers/resourceTable/provider";
import { TnResource } from "./builtinResources/TranslationNotes/provider";
import { AddedResourcesProvider } from "./providers/AddedResources/provider";
import { BibleUsfmResource } from "./builtinResources/usfmViewer/provider";

export function activate(context: vscode.ExtensionContext) {
  const extensionProvider = new ExtensionProvider();
  let disposable = vscode.commands.registerCommand(
    "codex-resources.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from Codex Resources!");
    }
  );
  context.subscriptions.push(disposable);

  context.subscriptions.push(AddedResourcesProvider.register(context));
  context.subscriptions.push(ResourcesProvider.register(context));

  extensionProvider.registerResource(new TWLResource());
  extensionProvider.registerResource(new TnResource());
  extensionProvider.registerResource(new BibleUsfmResource());

  return extensionProvider;
}
export function deactivate() {}
