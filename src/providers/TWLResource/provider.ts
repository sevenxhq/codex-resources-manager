import { Uri } from "vscode";
import { CodexResource, DownloadedResource } from "../../types/codexResource";
import { Twl, TwlApiResponse } from "./types";
import moment from "moment";
import JSZip from "jszip";
import { getNonce, getUri } from "../../utilities";
import { MessageType } from "../../types";
import * as vscode from "vscode";
import { getVerseTranslationWordsList } from "./utils";
export class TWLResource implements CodexResource<Twl> {
  id = "codex.twl";
  displayLabel = "Translation Words List";

  downloadResource: CodexResource<Twl>["downloadResource"] = async (
    fullResource,
    { resourceFolderUri, fs }
  ) => {
    const downloadProjectName = `${fullResource?.name}`;
    const downloadResourceFolder = Uri.joinPath(
      resourceFolderUri,
      downloadProjectName
    );

    await fs.createDirectory(downloadResourceFolder);

    const res = await fetch(fullResource?.zipball_url);
    const blob = await res.arrayBuffer();

    const zipUri = Uri.joinPath(resourceFolderUri, `${fullResource?.name}.zip`);

    await fs.writeFile(zipUri, Buffer.from(blob));

    const fileContents = blob;
    const result = await JSZip.loadAsync(fileContents);
    const keys = Object.keys(result.files);

    for (const key of keys) {
      const item = result.files[key];
      if (item.dir) {
        await fs.createDirectory(
          Uri.joinPath(downloadResourceFolder, item.name)
        );
      } else {
        const bufferContent = Buffer.from(await item.async("arraybuffer"));
        const path = [...item?.name?.split("/")];
        path.shift();
        const fileUri = Uri.joinPath(downloadResourceFolder, path.join("/"));
        await fs.writeFile(fileUri, bufferContent);
      }
    }

    const metadataRes = await fetch(fullResource.metadata_json_url);
    const data = (await metadataRes.json()) as Record<string, any>;
    data.agOffline = true;
    data.meta = fullResource;
    data.lastUpdatedAg = moment().format();
    await fs.writeFile(
      Uri.joinPath(downloadResourceFolder, "metadata.json"),
      Buffer.from(JSON.stringify(data))
    );
    await fs.delete(zipUri);

    const resourceReturn = {
      resource: fullResource,
      folder: downloadResourceFolder,
      type: this.id,
    };

    const localPath: string = resourceReturn?.folder.path;

    const downloadedResource: DownloadedResource = {
      name: resourceReturn?.resource.name ?? "",
      id: String(resourceReturn?.resource.id) ?? "",
      localPath: localPath,
      type: resourceReturn?.type ?? "",
      remoteUrl: resourceReturn?.resource.url ?? "",
      version: resourceReturn?.resource.release.tag_name,
    };

    return downloadedResource;
  };

  getResources = async () => {
    return Promise.resolve();
  };

  getResourceById = async () => {
    return Promise.resolve();
  };

  getResourceDisplayData = async () => {
    return Promise.resolve();
  };

  openResource: CodexResource<Twl>["openResource"] = async (
    resource,
    helpers
  ) => {
    helpers.renderInWebview({
      handler: (webviewPanel) => {
        webviewPanel.webview.onDidReceiveMessage((e) =>
          handleResourceWebviewMessages(e, webviewPanel.webview.postMessage)
        );
      },
      getWebviewContent: (webview, extensionUri) => {
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
          "TranslationWordsList.js",
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
            <link rel="stylesheet" type="text/css" href="${codiconsUri}">
          <title>Translation Words Webview</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>`;
      },
      onWebviewVisible: async (webviewPanel) => {
        helpers.stateStore.storeListener("verseRef", async (verseRefStore) => {
          console.log("Opening TWL resource on verseRef change");
          const wordsList = await getVerseTranslationWordsList(
            resource,
            verseRefStore?.verseRef ?? "GEN 1:1"
          );
          webviewPanel.webview.postMessage({
            type: "update-twl",
            payload: {
              wordsList: wordsList,
            },
          });
        });
        const verseRefStore = await helpers.stateStore?.getStoreState(
          "verseRef"
        );
        console.log("Opening TWL resource", verseRefStore?.verseRef);
        const wordsList = await getVerseTranslationWordsList(
          resource,
          verseRefStore?.verseRef ?? "GEN 1:1"
        );

        console.log("TWL wordsList", wordsList);

        webviewPanel.webview.postMessage({
          type: "update-twl",
          payload: {
            wordsList: wordsList,
          },
        });
      },
    });
  };

  getTableDisplayData = async () => {
    const resourceUrl = `https://git.door43.org/api/v1/catalog/search?subject=TSV Translation Words Links&metadataType=rc`;

    const response = await fetch(resourceUrl);

    const responseJson = (await response.json()) as TwlApiResponse;

    if (responseJson?.data) {
      return responseJson.data.map((resource) => ({
        id: resource.id.toString(),
        name: resource.name,
        owner: {
          name: resource.repo.owner.full_name,
          url: resource.repo.owner.website,
          avatarUrl: resource.repo.owner.avatar_url,
        },
        version: {
          tag: resource.release.tag_name,
          releaseDate: new Date(resource.released),
        },
        fullResource: resource,
        resourceType: this.id,
      }));
    }

    return [];
  };
}

const handleResourceWebviewMessages = async (
  e: {
    type: MessageType;
    payload: unknown;
  },
  postWebviewMessage: (message: any) => void
) => {
  switch (e.type) {
    case MessageType.GET_TW_CONTENT: {
      try {
        const translationWord: {
          path: string;
        } = (e.payload as Record<string, any>)?.translationWord;

        if (!translationWord) {
          return;
        }

        const path = translationWord.path;

        if (!path) {
          return;
        }

        try {
          const content = await vscode.workspace.fs.readFile(
            vscode.Uri.file(path)
          );
          postWebviewMessage({
            type: "update-tw-content",
            payload: {
              content: content.toString(),
            },
          });
        } catch (e: any) {
          postWebviewMessage({
            type: "update-tw-content",
            payload: {
              error: e?.message,
              content: null,
            },
          });
        }
      } catch (error: any) {
        vscode.window.showErrorMessage(
          "Unable to read the given translation word: " + error?.message
        );
        postWebviewMessage({
          type: "update-tw-content",
          payload: {
            error: "Not found",
          },
        });
      }
      break;
    }
    default: {
      break;
    }
  }
};
