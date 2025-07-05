# Migration Guide: From Props to Zustand Stores

This guide shows how to migrate your existing components from prop-based state management to Zustand stores.

## Quick Start

### 1. Install and Setup

```bash
npm install zustand immer
```

### 2. Import Stores

```typescript
import {
  useCurrentPolyList,
  useIsDraggable,
  useSortedPolyLists,
  useTierListDataStore,
  useTierListUIStore,
} from "@/stores";
```

## Migration Examples

### Before: LocalTierListLayout.tsx (20+ state variables)

```typescript
// OLD: Complex state management with prop drilling
export default function TierListLayout() {
  const [tierListName, setTierListName] = useState(initialTierListName);
  const [statCount, setStatCount] = useState(5);
  const [currentPolyListId, setCurrentPolyListId] = useState("");
  const [polyLists, setPolyLists] = useState<PolyList[]>([]);
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isDraggable, setIsDraggable] = useState(true);
  const [selectedStatIndex, setSelectedStatIndex] = useState<number | null>(
    null
  );
  // ... 10+ more state variables

  // Passing 15+ props to child components
  return (
    <MainContent
      polyLists={polyLists}
      currentPolyListId={currentPolyListId}
      onPolyListSelect={handlePolyListSelect}
      onPolyListDelete={handlePolyListDelete}
      onPolyListNameChange={handlePolyListNameChange}
      onStatChange={handleStatChange}
      onStatSelect={setSelectedStatIndex}
      isDraggable={isDraggable}
      // ... many more props
    />
  );
}
```

### After: Simplified with Zustand

```typescript
// NEW: Clean component using Zustand stores
export default function TierListLayout() {
  // Just get the ID from props/params
  const { id } = useParams();

  // Everything else is handled by stores
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <MainContent />
        <RightSidebar />
      </div>
    </div>
  );
}
```

### Before: PolygonChart with Many Props

```typescript
// OLD: Heavy prop drilling
interface PolygonChartProps {
  stats: { [key: string]: number };
  hideLabels?: boolean;
  isPreview?: boolean;
  onStatChange?: (statIndex: number, newValue: number) => void;
  onStatSelect?: (statIndex: number | null) => void;
  isDraggable?: boolean;
}

export function PolygonChart({
  stats,
  hideLabels = false,
  isPreview = false,
  onStatChange,
  onStatSelect,
  isDraggable = false,
}: PolygonChartProps) {
  // Complex prop handling logic
}
```

### After: Simplified with Zustand

```typescript
// NEW: Minimal props, data from stores
interface PolygonChartProps {
  hideLabels?: boolean;
  isPreview?: boolean;
}

export function PolygonChart({
  hideLabels = false,
  isPreview = false,
}: PolygonChartProps) {
  // Get data from stores
  const currentPolyList = useCurrentPolyList();
  const isDraggable = useIsDraggable();
  const updateStat = useTierListDataStore((state) => state.updateStat);

  // Component is now much simpler
}
```

## Store Usage Patterns

### 1. Data Operations

```typescript
// Get current data
const currentPolyList = useCurrentPolyList();
const polyLists = useSortedPolyLists();
const statNames = useStatNames();

// Update data
const { updatePolyList, addPolyList, deletePolyList } = useTierListDataStore();

// Example: Update a stat
updateStat(polyListId, statIndex, { value: newValue });
```

### 2. UI State Management

```typescript
// Get UI state
const isDraggable = useIsDraggable();
const leftSidebarWidth = useLeftSidebarWidth();
const isSheetOpen = useIsSheetOpen();

// Update UI state
const { setIsDraggable, toggleLeftSidebar, setIsSheetOpen } =
  useTierListUIStore();
```

### 3. Settings Management

```typescript
// Get settings
const theme = useTheme();
const defaultStatCount = useDefaultStatCount();
const chartDefaults = useChartDefaults();

// Update settings
const { setTheme, setDefaultStatCount, setChartDefaults } =
  useSettingsActions();
```

## Component Migration Steps

### Step 1: Identify State Categories

Categorize your current state:

- **Data State**: polyLists, currentPolyListId, statCount, sortingConfigs → `useTierListDataStore`
- **UI State**: sidebar states, isDraggable, selectedStatIndex → `useTierListUIStore`
- **Settings**: theme, defaults, preferences → `useTierListSettingsStore`

### Step 2: Replace useState with Store Hooks

```typescript
// Before
const [polyLists, setPolyLists] = useState<PolyList[]>([]);
const [currentPolyListId, setCurrentPolyListId] = useState("");

// After
const polyLists = useTierListDataStore((state) => state.polyLists);
const currentPolyListId = useTierListDataStore(
  (state) => state.currentPolyListId
);
```

### Step 3: Replace Props with Store Access

```typescript
// Before: Component receives props
function MyComponent({ polyLists, onPolyListUpdate }) {
  // Use props
}

// After: Component uses stores directly
function MyComponent() {
  const polyLists = useSortedPolyLists();
  const updatePolyList = useTierListDataStore((state) => state.updatePolyList);
  // Use store data and actions
}
```

### Step 4: Remove Prop Drilling

```typescript
// Before: Parent passes many props
<ChildComponent
  polyLists={polyLists}
  currentPolyListId={currentPolyListId}
  onPolyListSelect={handlePolyListSelect}
  isDraggable={isDraggable}
  // ... 10+ more props
/>

// After: Child gets data from stores
<ChildComponent />
```

## Benefits After Migration

### 1. **Reduced Complexity**

- `LocalTierListLayout.tsx`: 500+ lines → ~50 lines
- No more prop drilling through 3+ component levels
- Each component only uses what it needs

### 2. **Better Performance**

- Components only re-render when their specific data changes
- No unnecessary re-renders from unrelated state updates
- Optimized selector subscriptions

### 3. **Easier Testing**

- Mock stores instead of complex prop setups
- Test components in isolation
- Predictable state management

### 4. **Future-Proof**

- Easy to switch from localStorage to Supabase
- Add new features without prop drilling
- Maintainable state logic

## Storage Migration Path

### Current: localStorage

```typescript
// Automatically uses localStorage
const store = useTierListDataStore();
```

### Future: Supabase

```typescript
// Switch to Supabase when ready
const store = useTierListDataStore();
// Behind the scenes: storage adapter automatically handles Supabase
```

### Migration Utility

```typescript
// Migrate user data when they log in
const migrateToSupabase = async (userId: string) => {
  const localData = localStorage.getItem("tier-list-data");
  if (localData) {
    await supabase.from("user_tier_lists").insert({
      user_id: userId,
      data: JSON.parse(localData),
    });
    localStorage.removeItem("tier-list-data");
  }
};
```

## Next Steps

1. **Start with UI Store**: Migrate sidebar states and drag interactions
2. **Move to Data Store**: Replace polyLists and statCount management
3. **Add Settings Store**: Implement user preferences
4. **Optimize Components**: Remove unnecessary props and simplify logic
5. **Plan Supabase Migration**: When ready, switch storage adapters

The migration can be done incrementally - you can start using stores in new components while keeping existing ones unchanged.
