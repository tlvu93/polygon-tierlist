# File Explorer Component

A reusable, customizable file and folder management component with drag and drop functionality, built with React and TypeScript.

## Features

- 📁 **File & Folder Management**: Create, delete, and organize files and folders
- 🎯 **Drag & Drop**: Intuitive drag and drop for moving files between folders
- 🎨 **Customizable Icons**: Customize file and folder icons based on type or extension
- 🔄 **Multi-Select**: Select multiple items for batch operations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔌 **Storage Agnostic**: Works with any storage backend through the storage interface
- 🎛️ **Configurable**: Toggle features on/off based on your needs
- ♿ **Accessible**: Built with accessibility in mind

## Installation

The component is built with the following dependencies:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react
```

## Basic Usage

```tsx
import {
  FileExplorer,
  LocalStorageFileExplorer,
} from "@/components/file-explorer";

const storage = new LocalStorageFileExplorer();

function MyApp() {
  return (
    <FileExplorer
      storage={storage}
      allowDragAndDrop={true}
      allowMultiSelect={false}
      onFileDoubleClick={(file) => console.log("Opening:", file.name)}
      onFolderDoubleClick={(folder) =>
        console.log("Navigating to:", folder.name)
      }
    />
  );
}
```

## Props

### FileExplorerProps

| Prop                  | Type                                            | Default               | Description                            |
| --------------------- | ----------------------------------------------- | --------------------- | -------------------------------------- |
| `storage`             | `FileExplorerStorage`                           | **Required**          | Storage implementation for persistence |
| `onFileClick`         | `(file: FileItem) => void`                      | `undefined`           | Called when a file is clicked          |
| `onFileDoubleClick`   | `(file: FileItem) => void`                      | `undefined`           | Called when a file is double-clicked   |
| `onFolderClick`       | `(folder: FolderItem) => void`                  | `undefined`           | Called when a folder is clicked        |
| `onFolderDoubleClick` | `(folder: FolderItem) => void`                  | `undefined`           | Called when a folder is double-clicked |
| `onItemDelete`        | `(item: ExplorerItem) => void`                  | `undefined`           | Called when an item is deleted         |
| `onItemRename`        | `(item: ExplorerItem, newName: string) => void` | `undefined`           | Called when an item is renamed         |
| `renderFileIcon`      | `(file: FileItem) => React.ReactNode`           | `undefined`           | Custom file icon renderer              |
| `renderFolderIcon`    | `(folder: FolderItem) => React.ReactNode`       | `undefined`           | Custom folder icon renderer            |
| `className`           | `string`                                        | `""`                  | Additional CSS classes                 |
| `emptyStateMessage`   | `string`                                        | `"No items found..."` | Message shown when no items exist      |
| `allowDragAndDrop`    | `boolean`                                       | `true`                | Enable drag and drop functionality     |
| `allowMultiSelect`    | `boolean`                                       | `false`               | Allow selecting multiple items         |
| `showFileSize`        | `boolean`                                       | `true`                | Show file size information             |
| `showModifiedDate`    | `boolean`                                       | `true`                | Show modified date information         |

## Types

### FileItem

```tsx
interface FileItem {
  id: string;
  name: string;
  type: "file";
  size?: number;
  modifiedAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
```

### FolderItem

```tsx
interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  items: (FileItem | FolderItem)[];
  modifiedAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
```

### FileExplorerStorage

```tsx
interface FileExplorerStorage {
  getItems: () => Promise<ExplorerItem[]>;
  createFile: (name: string, parentId?: string) => Promise<FileItem>;
  createFolder: (name: string, parentId?: string) => Promise<FolderItem>;
  deleteItem: (id: string) => Promise<boolean>;
  updateItem: (
    id: string,
    updates: Partial<ExplorerItem>
  ) => Promise<ExplorerItem | null>;
  moveItem: (itemId: string, targetFolderId?: string) => Promise<boolean>;
  reorderItems: (itemIds: string[], parentId?: string) => Promise<void>;
}
```

## Storage Implementations

### LocalStorageFileExplorer

A localStorage-based implementation for client-side storage:

```tsx
import { LocalStorageFileExplorer } from "@/components/file-explorer";

const storage = new LocalStorageFileExplorer();
```

### Custom Storage Implementation

You can create your own storage implementation by implementing the `FileExplorerStorage` interface:

```tsx
class MyCustomStorage implements FileExplorerStorage {
  async getItems(): Promise<ExplorerItem[]> {
    // Fetch items from your backend
    const response = await fetch("/api/files");
    return response.json();
  }

  async createFile(name: string, parentId?: string): Promise<FileItem> {
    // Create file in your backend
    const response = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId, type: "file" }),
    });
    return response.json();
  }

  // ... implement other methods
}
```

## Custom Icons

You can customize file and folder icons by providing render functions:

```tsx
import { FileText, Folder, Image, Music, Video } from "lucide-react";

const customFileIcon = (file: FileItem) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return <Image className="h-8 w-8 text-green-500" />;
    case "mp3":
    case "wav":
    case "flac":
      return <Music className="h-8 w-8 text-purple-500" />;
    case "mp4":
    case "avi":
    case "mov":
      return <Video className="h-8 w-8 text-red-500" />;
    default:
      return <FileText className="h-8 w-8 text-blue-500" />;
  }
};

const customFolderIcon = (folder: FolderItem) => {
  return <Folder className="h-8 w-8 text-yellow-500" />;
};

<FileExplorer
  storage={storage}
  renderFileIcon={customFileIcon}
  renderFolderIcon={customFolderIcon}
/>;
```

## Event Handling

The component provides various event handlers for user interactions:

```tsx
<FileExplorer
  storage={storage}
  onFileClick={(file) => console.log("File clicked:", file.name)}
  onFileDoubleClick={(file) => {
    // Open file in editor, viewer, etc.
    window.open(`/viewer/${file.id}`);
  }}
  onFolderClick={(folder) => console.log("Folder clicked:", folder.name)}
  onFolderDoubleClick={(folder) => {
    // Navigate into folder (handled automatically)
    console.log("Navigating to:", folder.name);
  }}
  onItemDelete={(item) => {
    // Show confirmation dialog
    if (confirm(`Delete ${item.name}?`)) {
      // Delete logic handled by storage
    }
  }}
/>
```

## Advanced Usage

### Multi-Select Mode

```tsx
<FileExplorer
  storage={storage}
  allowMultiSelect={true}
  onFileClick={(file) => {
    // Handle selection in multi-select mode
    console.log("File selected:", file.name);
  }}
/>
```

### Minimal Configuration

```tsx
<FileExplorer
  storage={storage}
  allowDragAndDrop={false}
  showFileSize={false}
  showModifiedDate={false}
  emptyStateMessage="No files found"
/>
```

### Custom Styling

```tsx
<FileExplorer
  storage={storage}
  className="my-custom-file-explorer"
  // Add custom CSS classes for styling
/>
```

## Demo

Visit `/file-explorer-demo` to see the component in action with various configurations.

## Storybook

The component includes Storybook stories demonstrating different use cases:

```bash
npm run storybook
```

## Contributing

When contributing to this component:

1. Follow the existing TypeScript patterns
2. Add proper JSDoc comments for new props
3. Update the Storybook stories for new features
4. Ensure accessibility standards are met
5. Add tests for new functionality

## License

This component is part of the project and follows the same license terms.
