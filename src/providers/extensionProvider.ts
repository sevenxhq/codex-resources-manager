import { Uri } from "vscode";
import {
  CodexResource,
  ConfigResourceValues,
  GetWebviewContent,
  RenderWebviewHandler,
} from "../types/codexResource";
import { initializeStateStore } from "../utilities/stateStore";
import { ResourceWebviewProvider } from "./ResourceWebviewProvider/provider";

export class ExtensionProvider {
  static instance: ExtensionProvider;
  static registeredResources: {
    [key: string]: CodexResource<any>; //TODO: Fix this any
  };

  static async openResource(resource: ConfigResourceValues, extensionUri: Uri) {
    const stateStore = await initializeStateStore();

    const resourceHandler =
      ExtensionProvider.registeredResources[resource.type];

    const renderInWebview = ({
      handler,
      getWebviewContent,
      onWebviewVisible,
    }: {
      handler: RenderWebviewHandler;
      getWebviewContent: GetWebviewContent;
      onWebviewVisible?: RenderWebviewHandler;
    }) => {
      const webviewProvider = ResourceWebviewProvider.createOrShow(
        extensionUri,
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
      stateStore: stateStore,
    });
  }

  constructor() {
    if (!ExtensionProvider.instance) {
      ExtensionProvider.instance = this;
    }
    ExtensionProvider.registeredResources = {};
  }

  registerResource(resource: CodexResource<any>) {
    ExtensionProvider.registeredResources[resource.id] = resource;
  }

  getInstance() {
    if (!ExtensionProvider.instance) {
      ExtensionProvider.instance = new ExtensionProvider();
    }
    return ExtensionProvider.instance;
  }
}
