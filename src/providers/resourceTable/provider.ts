import * as vscode from "vscode";
import { getNonce, getUri } from "../../utilities";
import { ExtensionProvider } from "../extensionProvider";

export class ResourcesProvider implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | undefined;
  private _registeredResources: typeof ExtensionProvider.registeredResources;
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const resourcesProvider = new ResourcesProvider(context);
    const providerRegistration = vscode.window.registerWebviewViewProvider(
      ResourcesProvider.viewType,
      resourcesProvider
    );
    return providerRegistration;
  }

  // public static async initProjectResources(context: vscode.ExtensionContext) {
  //   const resources = await getDownloadedResourcesFromProjectConfig();
  //   context.workspaceState.update("downloadedResources", resources);
  // }

  private static readonly viewType = "scribe.resources";

  constructor(private readonly context: vscode.ExtensionContext) {
    this._registeredResources = ExtensionProvider.registeredResources;
  }

  public async resolveWebviewView(
    webviewPanel: vscode.WebviewView,
    ctx: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewPanel.webview.html = this._getWebviewContent(
      webviewPanel.webview,
      this.context.extensionUri
    );

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(async (e: any) => {
      switch (e.type) {
        default:
          break;
      }
    });

    this._webviewView = webviewPanel;

    const initialRegisteredResources = this._getRegisteredResourcesList();

    webviewPanel.webview.postMessage({
      type: "SET_RESOURCES_TYPES",
      payload: { resourcesTypes: this._getRegisteredResourcesList() },
    });

    webviewPanel.webview.postMessage({
      type: "SET_RESOURCE_TABLE_DATA",
      payload: {
        tableData: await this._getResourceTableData(
          initialRegisteredResources[0].value
        ),
      },
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._webviewView = panel;
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ) {
    // The CSS file from the React build output

    const stylesUri = getUri(webview, extensionUri, [
      "ui",
      "build",
      "assets",
      "index.css",
    ]);
    // The View JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "ui",
      "build",
      "assets",
      "views",
      "ResourcesTable.js",
    ]);

    const codiconsUri = getUri(webview, extensionUri, [
      "node_modules",
      "@vscode/codicons",
      "dist",
      "codicon.css",
    ]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"> -->
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <link href="${codiconsUri}" rel="stylesheet" />
          <title>Sidebar vscode obs Resources</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
  _getRegisteredResourcesList() {
    const resources = this._registeredResources;
    const resourcesList = Object.entries(resources).map(([key, value]) => {
      return {
        value: key,
        label: value.displayLabel,
      };
    });
    return resourcesList;
  }

  async _getResourceTableData(key: string) {
    const resources = this._registeredResources;
    const data = await resources[key]?.getTableDisplayData();
    console.log("data", data);

    return data;
  }
}
