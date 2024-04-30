import * as vscode from "vscode";
import { ResourceDisplay } from "./shared";
import { StateStore } from "../utilities/stateStore";

export type DownloadResourceUtils = {
  fs: vscode.FileSystem;
  resourceFolderUri: vscode.Uri;
};

export type RenderWebviewHandler = (webview: vscode.WebviewPanel) => void;
export type GetWebviewContent = (
  webview: vscode.Webview,
  extensionUri: vscode.Uri
) => string;

export interface CodexResource<FullResource extends {} = {}> {
  id: string;
  displayLabel: string;
  downloadResource: (
    fullResource: FullResource,
    utils: DownloadResourceUtils
  ) => Promise<DownloadedResource>;
  getResourceById: () => Promise<void>;
  getTableDisplayData: () => Promise<ResourceDisplay<FullResource>[]>;
  openResource: (
    resource: DownloadedResource,
    helpers: {
      renderInWebview: (
        handler: RenderWebviewHandler,
        getWebviewContent: GetWebviewContent,
        onWebviewVisible?: RenderWebviewHandler
      ) => void;
      stateStore: StateStore;
    }
  ) => Promise<void>;
}

export type DownloadedResource = {
  name: string;
  id: string;
  localPath: string;
  remoteUrl: string;
  version: string;
  type: string;
};
