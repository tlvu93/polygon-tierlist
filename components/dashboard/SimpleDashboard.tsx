"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { localStorageAPI } from "@/utils/localStorage";

export default function SimpleDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newTierListName, setNewTierListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadItems = () => {
      try {
        const allItems = localStorageAPI.getAllItems();
        setItems(allItems);
      } catch (error) {
        console.error("Error loading items:", error);
        setError("Failed to load items");
      }
    };

    loadItems();
  }, []);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const newGroup = localStorageAPI.createGroup(newGroupName);
        setItems([...items, { ...newGroup, items: [], isGroup: true }]);
        setNewGroupName("");
      } catch (error) {
        console.error("Error creating group:", error);
        setError("Failed to create group");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateTierList = () => {
    if (newTierListName.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const newTierList = localStorageAPI.createTierList(newTierListName);
        setItems([...items, newTierList]);
        setNewTierListName("");
      } catch (error) {
        console.error("Error creating tier list:", error);
        setError("Failed to create tier list");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setError(null);
    try {
      const success = localStorageAPI.deleteGroup(itemId);
      if (success) {
        setItems((items) => items.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
    }
  };

  const handleDeleteTierList = (itemId: string) => {
    setError(null);
    try {
      const success = localStorageAPI.deleteTierList(itemId);
      if (success) {
        setItems((items) => items.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error("Error deleting tier list:", error);
      setError("Failed to delete tier list");
    }
  };

  const handleItemClick = (item: any) => {
    if (item.isGroup) {
      // Navigate into group (simplified for now)
      console.log("Navigate into group:", item.name);
    } else {
      // Navigate to tier list editor
      router.push(`/tier-list/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your tier lists and groups
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create new items */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Group
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateGroup}
                  disabled={isLoading || !newGroupName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Tier List
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTierListName}
                  onChange={(e) => setNewTierListName(e.target.value)}
                  placeholder="Enter tier list name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateTierList}
                  disabled={isLoading || !newTierListName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items list */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Items</h2>
          </div>
          <div className="p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No items yet. Create your first group or tier list!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <div className="flex gap-2">
                        {item.isGroup ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTierList(item.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.isGroup
                        ? `Group (${item.items?.length || 0} items)`
                        : "Tier List"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
