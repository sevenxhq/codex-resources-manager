import * as vscode from "vscode";
import { getNonce, getUri } from "../../utilities";
import { ExtensionProvider } from "../extensionProvider";
import { addDownloadedResourceToProjectConfig } from "../../utilities/projectConfig";
import { MessageType } from "../../types";
import {
  DownloadedResource,
  GetWebviewContent,
  RenderWebviewHandler,
} from "../../types/codexResource";
import { ResourceWebviewProvider } from "../ResourceWebviewProvider/provider";
import { getDownloadedResourcesFromProjectConfig } from "./utils";
import { StateStore, initializeStateStore } from "../../utilities/stateStore";
export class ResourcesProvider implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | undefined;
  private _registeredResources: typeof ExtensionProvider.registeredResources;
  private stateStore: StateStore | undefined;
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const resourcesProvider = new ResourcesProvider(context);
    const providerRegistration = vscode.window.registerWebviewViewProvider(
      ResourcesProvider.viewType,
      resourcesProvider
    );
    return providerRegistration;
  }

  private static readonly viewType = "scribe.resources";

  constructor(private readonly context: vscode.ExtensionContext) {
    this._registeredResources = ExtensionProvider.registeredResources;

    initializeStateStore().then((stateStore) => {
      this.stateStore = stateStore;
    });
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
    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      switch (e.type) {
        case MessageType.SET_CURRENT_RESOURCE_TYPE:
          webviewPanel.webview.postMessage({
            type: "SET_RESOURCE_TABLE_DATA",
            payload: {
              tableData: await this._getResourceTableData(
                e.payload.resourceType
              ),
            },
          });

          break;

        case MessageType.DOWNLOAD_RESOURCE:
          await this._downloadResource(
            e.payload.resourceType,
            e.payload.fullResource
          );
          break;

        case MessageType.OPEN_RESOURCE: {
          console.log("OPEN_RESOURCE: ", e.payload.resource);
          await this._openResource(e.payload.resource);
          break;
        }
        default:
          break;
      }
    });

    this._webviewView = webviewPanel;

    await this._initializeWebviewData();

    webviewPanel.onDidChangeVisibility(() => {
      if (webviewPanel.visible) {
        this._initializeWebviewData();
      }
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
          <title>Resources</title>
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
    return data;
  }

  // TODO: type fullResource
  async _downloadResource(resourceId: string, fullResource: any) {
    const resources = this._registeredResources;
    const resource = resources[resourceId];

    const fs = vscode.workspace.fs;
    const currentFolderURI = vscode.workspace.workspaceFolders?.[0].uri;

    if (!currentFolderURI) {
      await vscode.window.showErrorMessage(
        "Please open a workspace folder to download resources"
      );
      return;
    }

    const resourceFolderUri = vscode.Uri.joinPath(
      currentFolderURI,
      ".project",
      "resources"
    );

    const downloadedResource = await resource.downloadResource(fullResource, {
      fs,
      resourceFolderUri,
    });

    const updatedDownloadedResourcePath = {
      ...downloadedResource,
      localPath: downloadedResource.localPath.includes(currentFolderURI.path)
        ? downloadedResource.localPath.replace(currentFolderURI.path, "")
        : downloadedResource.localPath,
    };

    addDownloadedResourceToProjectConfig(updatedDownloadedResourcePath);
  }

  async _getDownloadedResources() {
    const downloadedResources = await getDownloadedResourcesFromProjectConfig();

    return downloadedResources ?? [];
  }

  async _openResource(resource: DownloadedResource) {
    if (!this.stateStore) {
      this.stateStore = await initializeStateStore();
    }
    const resourceHandler = this._registeredResources[resource.type];

    const renderInWebview = (
      handler: RenderWebviewHandler,
      getWebviewContent: GetWebviewContent,
      onWebviewVisible?: RenderWebviewHandler
    ) => {
      const webviewProvider = ResourceWebviewProvider.createOrShow(
        this.context.extensionUri,
        {
          viewType: resourceHandler.id,
          title: resourceHandler.displayLabel,
        },
        {
          getWebviewContent,
          onWebviewVisible,
        }
      );

      if (!webviewProvider) {
        throw new Error("Webview not found");
      }
      handler(webviewProvider.panel);
    };

    resourceHandler.openResource(resource, {
      renderInWebview,
      stateStore: this.stateStore,
    });
  }

  private async _initializeWebviewData() {
    const initialRegisteredResources = this._getRegisteredResourcesList();
    const webviewPanel = this._webviewView;

    if (!webviewPanel) {
      return;
    }

    webviewPanel.webview.postMessage({
      type: "SET_RESOURCES_TYPES",
      payload: { resourcesTypes: initialRegisteredResources },
    });

    webviewPanel.webview.postMessage({
      type: "SET_RESOURCE_TABLE_DATA",
      payload: {
        tableData: await this._getResourceTableData(
          initialRegisteredResources[0].value
        ),
      },
    });

    webviewPanel.webview.postMessage({
      type: "SET_DOWNLOADED_RESOURCES",
      payload: {
        downloadedResources: await this._getDownloadedResources(),
      },
    });
  }
}
