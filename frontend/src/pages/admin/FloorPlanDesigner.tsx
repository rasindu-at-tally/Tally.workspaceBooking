import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { Layout } from '@/components/Layout';
import { Trash2, Save, Undo, Armchair, RectangleHorizontal, Download } from 'lucide-react';
import { floorPlansApi, FloorPlanItem } from '@/lib/api/floorPlans';
import { useLocations } from '@/hooks/useDesks';

interface FloorItem extends FloorPlanItem {
  deskName?: string;
  deskId?: number;
}

// Desk Component - Realistic office desk
function DeskItem({ 
  item, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  item: FloorItem; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (newAttrs: Partial<FloorItem>) => void;
}) {
  return (
    <Group
      x={item.x}
      y={item.y}
      draggable
      rotation={item.rotation}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {/* Desk legs shadow */}
      <Rect
        x={8}
        y={78}
        width={8}
        height={4}
        fill="rgba(0,0,0,0.2)"
        cornerRadius={2}
      />
      <Rect
        x={104}
        y={78}
        width={8}
        height={4}
        fill="rgba(0,0,0,0.2)"
        cornerRadius={2}
      />
      
      {/* Desk surface - main */}
      <Rect
        width={120}
        height={80}
        fill="#8B7355"
        stroke={isSelected ? '#3b82f6' : '#654321'}
        strokeWidth={isSelected ? 4 : 2}
        shadowColor="black"
        shadowBlur={8}
        shadowOpacity={0.4}
        shadowOffset={{ x: 3, y: 3 }}
        cornerRadius={8}
      />
      
      {/* Desk top surface */}
      <Rect
        x={4}
        y={4}
        width={112}
        height={72}
        fill="#A0826D"
        cornerRadius={6}
      />
      
      {/* Desk legs */}
      <Rect
        x={10}
        y={70}
        width={8}
        height={12}
        fill="#654321"
        cornerRadius={2}
      />
      <Rect
        x={102}
        y={70}
        width={8}
        height={12}
        fill="#654321"
        cornerRadius={2}
      />
      
      {/* Desk drawer left */}
      <Rect
        x={20}
        y={50}
        width={35}
        height={12}
        fill="#654321"
        stroke="#4a3319"
        strokeWidth={1}
        cornerRadius={3}
      />
      <Rect
        x={35}
        y={54}
        width={5}
        height={4}
        fill="#4a3319"
        cornerRadius={1}
      />
      
      {/* Desk drawer right */}
      <Rect
        x={65}
        y={50}
        width={35}
        height={12}
        fill="#654321"
        stroke="#4a3319"
        strokeWidth={1}
        cornerRadius={3}
      />
      <Rect
        x={80}
        y={54}
        width={5}
        height={4}
        fill="#4a3319"
        cornerRadius={1}
      />
      
      {/* Label */}
      {item.deskName && (
        <Text
          x={10}
          y={18}
          text={item.deskName}
          fontSize={14}
          fontStyle="bold"
          fill="#fff"
          shadowColor="black"
          shadowBlur={3}
          shadowOpacity={0.5}
        />
      )}
    </Group>
  );
}

// Chair Component - Realistic office chair
function ChairItem({ 
  item, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  item: FloorItem; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (newAttrs: Partial<FloorItem>) => void;
}) {
  return (
    <Group
      x={item.x}
      y={item.y}
      draggable
      rotation={item.rotation}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {/* Chair base shadow */}
      <Rect
        x={5}
        y={48}
        width={35}
        height={4}
        fill="rgba(0,0,0,0.2)"
        cornerRadius={2}
      />
      
      {/* Chair backrest */}
      <Rect
        x={0}
        y={0}
        width={45}
        height={12}
        fill="#2563eb"
        stroke={isSelected ? '#3b82f6' : '#1e40af'}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={6}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.3}
      />
      
      {/* Backrest cushion */}
      <Rect
        x={3}
        y={2}
        width={39}
        height={8}
        fill="#60a5fa"
        cornerRadius={4}
      />
      
      {/* Chair seat */}
      <Rect
        x={0}
        y={14}
        width={45}
        height={32}
        fill="#3b82f6"
        stroke={isSelected ? '#2563eb' : '#1e40af'}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={6}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.3}
      />
      
      {/* Seat cushion */}
      <Rect
        x={3}
        y={17}
        width={39}
        height={26}
        fill="#60a5fa"
        cornerRadius={4}
      />
      
      {/* Chair base/stand */}
      <Rect
        x={18}
        y={46}
        width={9}
        height={8}
        fill="#1e40af"
        cornerRadius={2}
      />
      
      {/* Chair wheels */}
      <Rect
        x={8}
        y={52}
        width={6}
        height={3}
        fill="#374151"
        cornerRadius={1.5}
      />
      <Rect
        x={31}
        y={52}
        width={6}
        height={3}
        fill="#374151"
        cornerRadius={1.5}
      />
    </Group>
  );
}

export function FloorPlanDesigner() {
  const [items, setItems] = useState<FloorItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1800, height: 900 });
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const stageRef = useRef<any>(null);
  const { data: locations = [] } = useLocations();

  const addDesk = () => {
    const newDesk: FloorItem = {
      id: `desk-${Date.now()}`,
      type: 'desk',
      x: 100 + (items.length * 20) % 400, // Stagger positions
      y: 100 + (items.length * 20) % 300,
      rotation: 0,
      deskName: undefined,
      deskId: undefined,
    };
    setItems([...items, newDesk]);
    setSelectedId(newDesk.id);
  };

  const addChair = () => {
    const newChair: FloorItem = {
      id: `chair-${Date.now()}`,
      type: 'chair',
      x: 150 + (items.length * 20) % 400, // Stagger positions
      y: 150 + (items.length * 20) % 300,
      rotation: 0,
      deskName: undefined,
      deskId: undefined,
    };
    setItems([...items, newChair]);
    setSelectedId(newChair.id);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setItems(items.filter(item => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  const rotateSelected = () => {
    if (selectedId) {
      setItems(items.map(item => 
        item.id === selectedId 
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      ));
    }
  };

  const updateItem = (id: string, newAttrs: Partial<FloorItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...newAttrs } : item
    ));
  };

  // Load floor plan for selected location
  const loadFloorPlan = async (location: string) => {
    if (!location) return;
    
    setIsLoading(true);
    try {
      const floorPlan = await floorPlansApi.getByLocation(location);
      const loadedItems: FloorItem[] = JSON.parse(floorPlan.layout_data);
      setItems(loadedItems);
      setSelectedId(null);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No floor plan exists for this location yet
        setItems([]);
        setSelectedId(null);
      } else {
        console.error('Error loading floor plan:', error);
        alert('Failed to load floor plan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load floor plan when location changes
  useEffect(() => {
    if (selectedLocation) {
      loadFloorPlan(selectedLocation);
    }
  }, [selectedLocation]);

  const saveLayout = async () => {
    if (!selectedLocation) {
      alert('Please select a location first');
      return;
    }

    console.log('[FloorPlanDesigner] Saving floor plan...');
    console.log('[FloorPlanDesigner] Location:', selectedLocation);
    console.log('[FloorPlanDesigner] Items to save:', JSON.stringify(items, null, 2));

    setIsSaving(true);
    try {
      const savedFloorPlan = await floorPlansApi.save(selectedLocation, items);
      console.log('[FloorPlanDesigner] Save successful!', savedFloorPlan);
      
      // Reload the floor plan to get the updated data with desk links
      await loadFloorPlan(selectedLocation);
      
      alert(`Floor plan saved successfully! ${items.length} items (desks/chairs) are now bookable.`);
    } catch (error) {
      console.error('Error saving floor plan:', error);
      alert('Failed to save floor plan');
    } finally {
      setIsSaving(false);
    }
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear the entire floor plan?')) {
      setItems([]);
      setSelectedId(null);
    }
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const selectedItem = items.find(item => item.id === selectedId);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Floor Plan Designer</h1>
          <p className="mt-2 text-gray-600">
            Design your office layout by dragging and dropping desks and chairs
          </p>
        </div>

        {/* Location Selector */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Select Location
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="block w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Choose a location...</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {isLoading && <p className="mt-2 text-sm text-gray-600">Loading floor plan...</p>}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4 shadow-sm">
          <button
            onClick={addDesk}
            disabled={!selectedLocation}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RectangleHorizontal className="h-5 w-5" />
            Add Desk
          </button>
          
          <button
            onClick={addChair}
            disabled={!selectedLocation}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Armchair className="h-5 w-5" />
            Add Chair
          </button>

          {selectedId && (
            <>
              <button
                onClick={rotateSelected}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition"
              >
                <Undo className="h-5 w-5" />
                Rotate
              </button>
              
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
            </>
          )}

          <div className="ml-auto flex gap-3">
            <button
              onClick={clearCanvas}
              disabled={!selectedLocation}
              className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
            
            <button
              onClick={saveLayout}
              disabled={!selectedLocation || isSaving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>

        {/* Selected Item Info */}
        {selectedItem && (
          <div className="rounded-lg border bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Selected Item</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-blue-700">
                Type: <span className="font-medium capitalize">{selectedItem.type}</span>
              </p>
              <p className="text-sm text-blue-700">
                Position: X: {Math.round(selectedItem.x)}, Y: {Math.round(selectedItem.y)}
              </p>
            <p className="text-sm text-blue-700">
              Rotation: {selectedItem.rotation}°
            </p>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          {!selectedLocation ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center" style={{ height: '900px' }}>
              <div className="flex flex-col items-center justify-center h-full">
                <Download className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Location Selected</h3>
                <p className="text-gray-600">Please select a location above to start designing the floor plan</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg overflow-auto" style={{ height: '900px' }}>
              <Stage
                ref={stageRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
              >
              <Layer>
                {/* Grid background */}
                {Array.from({ length: Math.ceil(canvasSize.width / 50) }).map((_, i) => (
                  <Rect
                    key={`v-${i}`}
                    x={i * 50}
                    y={0}
                    width={1}
                    height={canvasSize.height}
                    fill="#e5e7eb"
                  />
                ))}
                {Array.from({ length: Math.ceil(canvasSize.height / 50) }).map((_, i) => (
                  <Rect
                    key={`h-${i}`}
                    x={0}
                    y={i * 50}
                    width={canvasSize.width}
                    height={1}
                    fill="#e5e7eb"
                  />
                ))}

                {/* Render items */}
                {items.map(item => {
                  if (item.type === 'desk') {
                    return (
                      <DeskItem
                        key={item.id}
                        item={item}
                        isSelected={item.id === selectedId}
                        onSelect={() => setSelectedId(item.id)}
                        onChange={(newAttrs) => updateItem(item.id, newAttrs)}
                      />
                    );
                  } else {
                    return (
                      <ChairItem
                        key={item.id}
                        item={item}
                        isSelected={item.id === selectedId}
                        onSelect={() => setSelectedId(item.id)}
                        onChange={(newAttrs) => updateItem(item.id, newAttrs)}
                      />
                    );
                  }
                })}
              </Layer>
            </Stage>
          </div>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Instructions</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            <li><strong>First, select a location</strong> from the dropdown above</li>
            <li>Click "Add Desk" to add as many desk icons as you want</li>
            <li>Click "Add Chair" to add as many chair icons as you want</li>
            <li>Drag items to position them on the floor plan</li>
            <li>Click an item to select it</li>
            <li>Use "Rotate" to change item orientation (90° increments)</li>
            <li>Use "Delete" to remove the selected item</li>
            <li>Click "Save Layout" - <strong>this automatically makes each item bookable!</strong></li>
          </ul>
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 How it works:</strong> When you save, each desk and chair becomes an independent bookable item. 
              Employees can click on any desk or chair to book it for their selected date.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

