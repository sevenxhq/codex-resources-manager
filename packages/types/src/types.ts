import * as vscode from "vscode";

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
      renderInWebview: (fns: {
        handler: RenderWebviewHandler;
        getWebviewContent: GetWebviewContent;
        onWebviewVisible?: RenderWebviewHandler;
      }) => void;
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

type DisposeFunction = () => void;

export type ResourceDisplay<FullResource> = {
  id: string;
  name: string;
  version: {
    tag: string;
    releaseDate: Date;
  };
  owner: {
    name: string;
    url: string;
    avatarUrl: string;
  };
  fullResource: FullResource;
  resourceType: string;
};

export type StateStore = {
  storeListener: <K extends string, V extends object>(
    key: K,
    callBack: (value: V | undefined) => void
  ) => DisposeFunction;
  updateStoreState: <K extends string, V extends object>(update: {
    key: K;
    value: V;
  }) => void;
  getStoreState: <K extends string, V extends object>(
    key: K
  ) => Promise<V | undefined>;
};
