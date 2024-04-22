import { CodexResource } from "../types/codexResource";

export class ExtensionProvider {
  static instance: ExtensionProvider;
  static registeredResources: {
    [key: string]: CodexResource;
  };

  constructor() {
    if (!ExtensionProvider.instance) {
      ExtensionProvider.instance = this;
    }
    ExtensionProvider.registeredResources = {};
  }

  registerResource(resource: CodexResource) {
    ExtensionProvider.registeredResources[resource.id] = resource;
  }

  getInstance() {
    if (!ExtensionProvider.instance) {
      ExtensionProvider.instance = new ExtensionProvider();
    }
    return ExtensionProvider.instance;
  }
}
