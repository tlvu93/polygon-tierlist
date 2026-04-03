"use client";

import React from "react";
import {
  FileExplorer,
  LocalStorageFileExplorer,
} from "@/components/file-explorer";
import { FileItem, FolderItem } from "@/components/file-explorer/types";
import { FileText, Folder, Image, Music, Video } from "lucide-react";

export default function FileExplorerDemo() {
  const storage = new LocalStorageFileExplorer();

  // Custom icon renderers
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

  const handleFileClick = (file: FileItem) => {
    console.log("File clicked:", file.name);
  };

  const handleFileDoubleClick = (file: FileItem) => {
    console.log("File double-clicked:", file.name);
    alert(`Opening file: ${file.name}`);
  };

  const handleFolderClick = (folder: FolderItem) => {
    console.log("Folder clicked:", folder.name);
  };

  const handleFolderDoubleClick = (folder: FolderItem) => {
    console.log("Folder double-clicked:", folder.name);
  };

  const handleItemDelete = (item: FileItem | FolderItem) => {
    console.log("Item deleted:", item.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Explorer Component Demo
          </h1>
          <p className="text-gray-600">
            A reusable file and folder management component with drag and drop
            functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic File Explorer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic File Explorer
            </h2>
            <FileExplorer
              storage={storage}
              allowDragAndDrop={true}
              allowMultiSelect={false}
              showFileSize={true}
              showModifiedDate={true}
              onFileClick={handleFileClick}
              onFileDoubleClick={handleFileDoubleClick}
              onFolderClick={handleFolderClick}
              onFolderDoubleClick={handleFolderDoubleClick}
              onItemDelete={handleItemDelete}
            />
          </div>

          {/* File Explorer with Custom Icons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              File Explorer with Custom Icons
            </h2>
            <FileExplorer
              storage={storage}
              renderFileIcon={customFileIcon}
              renderFolderIcon={customFolderIcon}
              allowDragAndDrop={true}
              allowMultiSelect={true}
              showFileSize={true}
              showModifiedDate={true}
              onFileClick={handleFileClick}
              onFileDoubleClick={handleFileDoubleClick}
              onFolderClick={handleFolderClick}
              onFolderDoubleClick={handleFolderDoubleClick}
              onItemDelete={handleItemDelete}
            />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                File Management
              </h3>
              <p className="text-sm text-blue-700">
                Create, delete, and organize files with ease
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">
                Folder Organization
              </h3>
              <p className="text-sm text-green-700">
                Create nested folders and navigate through them
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Drag & Drop</h3>
              <p className="text-sm text-purple-700">
                Intuitive drag and drop for moving files between folders
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Custom Icons</h3>
              <p className="text-sm text-yellow-700">
                Customize file and folder icons based on type or extension
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Multi-Select</h3>
              <p className="text-sm text-red-700">
                Select multiple items for batch operations
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-900 mb-2">
                Storage Agnostic
              </h3>
              <p className="text-sm text-indigo-700">
                Works with any storage backend through the storage interface
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Example
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            {`import { FileExplorer, LocalStorageFileExplorer } from "@/components/file-explorer";

const storage = new LocalStorageFileExplorer();

function MyApp() {
  return (
    <FileExplorer
      storage={storage}
      allowDragAndDrop={true}
      allowMultiSelect={false}
      onFileDoubleClick={(file) => console.log("Opening:", file.name)}
      onFolderDoubleClick={(folder) => console.log("Navigating to:", folder.name)}
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
