import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle } from 'react-konva';
import { Layout } from '@/components/Layout';
import { Trash2, Save, Undo, RectangleHorizontal, Download, Users } from 'lucide-react';
import { floorPlansApi, FloorPlanItem } from '@/lib/api/floorPlans';
import { useLocations } from '@/hooks/useDesks';
import { useToast } from '@/components/Toast';

type FloorItem = FloorPlanItem & {
  seats?: number; // Number of seats (1, 2, 3, etc.)
};

// Single Seat Desk Component - Compact design
function SingleSeatDesk({ 
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
  const width = 60;
  const height = 50;
  
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
      {/* Desk surface */}
      <Rect
        width={width}
        height={height}
        fill="#78716c"
        stroke={isSelected ? '#06b6d4' : '#57534e'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      
      {/* Desk top */}
      <Rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        fill="#a8a29e"
        cornerRadius={3}
      />
      
      {/* Chair indicator */}
      <Circle
        x={width / 2}
        y={height + 12}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      
      {/* Seat count badge */}
      <Circle
        x={width - 5}
        y={5}
        radius={8}
        fill="#06b6d4"
      />
      <Text
        x={width - 9}
        y={1}
        text="1"
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
      />
      
      {/* Label */}
      {item.deskName && (
        <Text
          x={3}
          y={height / 2 - 5}
          text={item.deskName.length > 6 ? item.deskName.substring(0, 6) : item.deskName}
          fontSize={9}
          fontStyle="bold"
          fill="#374151"
        />
      )}
    </Group>
  );
}

// Two Seat Desk Component - Wider desk with 2 chairs
function TwoSeatDesk({ 
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
  const width = 100;
  const height = 50;
  
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
      {/* Desk surface */}
      <Rect
        width={width}
        height={height}
        fill="#78716c"
        stroke={isSelected ? '#06b6d4' : '#57534e'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      
      {/* Desk top */}
      <Rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        fill="#a8a29e"
        cornerRadius={3}
      />
      
      {/* Divider line */}
      <Rect
        x={width / 2 - 0.5}
        y={5}
        width={1}
        height={height - 10}
        fill="#78716c"
      />
      
      {/* Chair indicators */}
      <Circle
        x={width / 4}
        y={height + 12}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      <Circle
        x={(width / 4) * 3}
        y={height + 12}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      
      {/* Seat count badge */}
      <Circle
        x={width - 5}
        y={5}
        radius={8}
        fill="#06b6d4"
      />
      <Text
        x={width - 9}
        y={1}
        text="2"
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
      />
      
      {/* Label */}
      {item.deskName && (
        <Text
          x={3}
          y={height / 2 - 5}
          text={item.deskName.length > 10 ? item.deskName.substring(0, 10) : item.deskName}
          fontSize={9}
          fontStyle="bold"
          fill="#374151"
        />
      )}
    </Group>
  );
}

// Three Seat Desk Component - Long desk with 3 chairs
function ThreeSeatDesk({ 
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
  const width = 140;
  const height = 50;
  
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
      {/* Desk surface */}
      <Rect
        width={width}
        height={height}
        fill="#78716c"
        stroke={isSelected ? '#06b6d4' : '#57534e'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      
      {/* Desk top */}
      <Rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        fill="#a8a29e"
        cornerRadius={3}
      />
      
      {/* Divider lines */}
      <Rect
        x={width / 3 - 0.5}
        y={5}
        width={1}
        height={height - 10}
        fill="#78716c"
      />
      <Rect
        x={(width / 3) * 2 - 0.5}
        y={5}
        width={1}
        height={height - 10}
        fill="#78716c"
      />
      
      {/* Chair indicators */}
      <Circle
        x={width / 6}
        y={height + 12}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      <Circle
        x={width / 2}
        y={height + 12}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      <Circle
        x={(width / 6) * 5}
        y={height + 12}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      
      {/* Seat count badge */}
      <Circle
        x={width - 5}
        y={5}
        radius={8}
        fill="#06b6d4"
      />
      <Text
        x={width - 9}
        y={1}
        text="3"
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
      />
      
      {/* Label */}
      {item.deskName && (
        <Text
          x={3}
          y={height / 2 - 5}
          text={item.deskName.length > 14 ? item.deskName.substring(0, 14) : item.deskName}
          fontSize={9}
          fontStyle="bold"
          fill="#374151"
        />
      )}
    </Group>
  );
}

// Four Seat Desk Component - Square desk with 4 chairs (2 on each side)
function FourSeatDesk({ 
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
  const width = 100;
  const height = 70;
  
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
      {/* Desk surface */}
      <Rect
        y={15}
        width={width}
        height={height}
        fill="#78716c"
        stroke={isSelected ? '#06b6d4' : '#57534e'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      
      {/* Desk top */}
      <Rect
        x={2}
        y={17}
        width={width - 4}
        height={height - 4}
        fill="#a8a29e"
        cornerRadius={3}
      />
      
      {/* Cross divider */}
      <Rect
        x={width / 2 - 0.5}
        y={20}
        width={1}
        height={height - 10}
        fill="#78716c"
      />
      <Rect
        x={5}
        y={15 + height / 2 - 0.5}
        width={width - 10}
        height={1}
        fill="#78716c"
      />
      
      {/* Top chairs */}
      <Circle
        x={width / 4}
        y={5}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      <Circle
        x={(width / 4) * 3}
        y={5}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      
      {/* Bottom chairs */}
      <Circle
        x={width / 4}
        y={height + 25}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      <Circle
        x={(width / 4) * 3}
        y={height + 25}
        radius={8}
        fill="#3b82f6"
        stroke={isSelected ? '#06b6d4' : '#2563eb'}
        strokeWidth={1}
      />
      
      {/* Seat count badge */}
      <Circle
        x={width - 5}
        y={20}
        radius={8}
        fill="#06b6d4"
      />
      <Text
        x={width - 9}
        y={16}
        text="4"
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
      />
      
      {/* Label */}
      {item.deskName && (
        <Text
          x={3}
          y={15 + height / 2 - 5}
          text={item.deskName.length > 10 ? item.deskName.substring(0, 10) : item.deskName}
          fontSize={9}
          fontStyle="bold"
          fill="#374151"
        />
      )}
    </Group>
  );
}

// Six Seat Desk Component - Conference style (3 on each side)
function SixSeatDesk({ 
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
  const width = 150;
  const height = 60;
  
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
      {/* Desk surface */}
      <Rect
        y={15}
        width={width}
        height={height}
        fill="#78716c"
        stroke={isSelected ? '#06b6d4' : '#57534e'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      
      {/* Desk top */}
      <Rect
        x={2}
        y={17}
        width={width - 4}
        height={height - 4}
        fill="#a8a29e"
        cornerRadius={3}
      />
      
      {/* Top chairs */}
      <Circle x={width / 6} y={5} radius={8} fill="#3b82f6" stroke={isSelected ? '#06b6d4' : '#2563eb'} strokeWidth={1} />
      <Circle x={width / 2} y={5} radius={8} fill="#3b82f6" stroke={isSelected ? '#06b6d4' : '#2563eb'} strokeWidth={1} />
      <Circle x={(width / 6) * 5} y={5} radius={8} fill="#3b82f6" stroke={isSelected ? '#06b6d4' : '#2563eb'} strokeWidth={1} />
      
      {/* Bottom chairs */}
      <Circle x={width / 6} y={height + 25} radius={8} fill="#3b82f6" stroke={isSelected ? '#06b6d4' : '#2563eb'} strokeWidth={1} />
      <Circle x={width / 2} y={height + 25} radius={8} fill="#3b82f6" stroke={isSelected ? '#06b6d4' : '#2563eb'} strokeWidth={1} />
      <Circle x={(width / 6) * 5} y={height + 25} radius={8} fill="#3b82f6" stroke={isSelected ? '#06b6d4' : '#2563eb'} strokeWidth={1} />
      
      {/* Seat count badge */}
      <Circle x={width - 5} y={20} radius={8} fill="#06b6d4" />
      <Text x={width - 9} y={16} text="6" fontSize={10} fontStyle="bold" fill="#fff" />
      
      {/* Label */}
      {item.deskName && (
        <Text
          x={3}
          y={15 + height / 2 - 5}
          text={item.deskName.length > 16 ? item.deskName.substring(0, 16) : item.deskName}
          fontSize={9}
          fontStyle="bold"
          fill="#374151"
        />
      )}
    </Group>
  );
}

export function FloorPlanDesigner() {
  const [items, setItems] = useState<FloorItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 1800, height: 900 });
  const [stageScale, setStageScale] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const stageRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const { data: locations = [] } = useLocations();
  const { showToast } = useToast();

  const addDesk = (seats: number) => {
    const newDesk: FloorItem = {
      id: `desk-${seats}seat-${Date.now()}`,
      type: 'desk',
      x: 100 + (items.length * 30) % 400,
      y: 100 + (items.length * 30) % 300,
      rotation: 0,
      deskName: undefined,
      deskId: undefined,
      seats: seats,
    };
    setItems([...items, newDesk]);
    setSelectedId(newDesk.id);
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

  // Make the designer canvas responsive by scaling to container width
  useEffect(() => {
    const updateScale = () => {
      const container = canvasContainerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const targetWidth = canvasSize.width;

      if (!containerWidth) return;

      const scale = Math.min(containerWidth / targetWidth, 1);
      setStageScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasSize.width]);

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
        showToast({
          type: 'error',
          message: 'Failed to load floor plan. Please try again.',
        });
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
      showToast({
        type: 'info',
        message: 'Please select a location before saving the layout.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await floorPlansApi.save(selectedLocation, items);
      
      // Reload the floor plan to get the updated data with desk links
      await loadFloorPlan(selectedLocation);

      const totalSeats = items.reduce((sum, item) => sum + (item.seats || 1), 0);
      showToast({
        type: 'success',
        message: `Floor plan saved! ${items.length} desks with ${totalSeats} total seats are now bookable.`,
      });
    } catch (error) {
      console.error('Error saving floor plan:', error);
      showToast({
        type: 'error',
        message: 'Failed to save floor plan. Please try again.',
      });
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
  const totalSeats = items.reduce((sum, item) => sum + (item.seats || 1), 0);

  const renderDeskItem = (item: FloorItem) => {
    const seats = item.seats || 1;
    const props = {
      item,
      isSelected: item.id === selectedId,
      onSelect: () => setSelectedId(item.id),
      onChange: (newAttrs: Partial<FloorItem>) => updateItem(item.id, newAttrs),
    };

    switch (seats) {
      case 1:
        return <SingleSeatDesk key={item.id} {...props} />;
      case 2:
        return <TwoSeatDesk key={item.id} {...props} />;
      case 3:
        return <ThreeSeatDesk key={item.id} {...props} />;
      case 4:
        return <FourSeatDesk key={item.id} {...props} />;
      case 6:
        return <SixSeatDesk key={item.id} {...props} />;
      default:
        return <SingleSeatDesk key={item.id} {...props} />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">Floor Plan Designer</h1>
            <p className="mt-2 text-gray-600">
              Design your office layout with multi-seater desks
            </p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2">
                <RectangleHorizontal className="h-4 w-4 text-cyan-600" />
                <span className="font-medium text-cyan-700">{items.length} Desks</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">{totalSeats} Seats</span>
              </div>
            </div>
          )}
        </div>

        {/* Location Selector */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Select Location
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="block w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700">Add Desk by Seat Count:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 6].map((seats) => (
              <button
                key={seats}
                onClick={() => addDesk(seats)}
                disabled={!selectedLocation}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-white text-sm font-medium hover:from-cyan-600 hover:to-teal-600 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm"
              >
                <Users className="h-4 w-4" />
                {seats} Seat{seats > 1 ? 's' : ''}
              </button>
            ))}
            
            <div className="h-8 w-px bg-gray-300 mx-2" />

            {selectedId && (
              <>
                <button
                  onClick={rotateSelected}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white text-sm font-medium hover:bg-purple-700 transition"
                >
                  <Undo className="h-4 w-4" />
                  Rotate
                </button>
                
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={clearCanvas}
                disabled={!selectedLocation || items.length === 0}
                className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white text-sm font-medium hover:bg-gray-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              
              <button
                onClick={saveLayout}
                disabled={!selectedLocation || isSaving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Layout'}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Item Info */}
        {selectedItem && (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <h3 className="font-semibold text-cyan-900">Selected Desk</h3>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-cyan-700">
              <span>Seats: <strong>{selectedItem.seats || 1}</strong></span>
              <span>Position: X: {Math.round(selectedItem.x)}, Y: {Math.round(selectedItem.y)}</span>
              <span>Rotation: {selectedItem.rotation}°</span>
              {selectedItem.deskName && <span>Name: {selectedItem.deskName}</span>}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          {!selectedLocation ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center" style={{ height: '600px' }}>
              <div className="flex flex-col items-center justify-center h-full">
                <Download className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Location Selected</h3>
                <p className="text-gray-600">Please select a location above to start designing the floor plan</p>
              </div>
            </div>
          ) : (
            <div
              ref={canvasContainerRef}
              className="bg-gray-100 rounded-lg overflow-auto"
              style={{ height: '600px' }}
            >
              <Stage
                ref={stageRef}
                width={canvasSize.width}
                height={canvasSize.height}
                scaleX={stageScale}
                scaleY={stageScale}
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

                  {/* Render desk items */}
                  {items.map(item => renderDeskItem(item))}
                </Layer>
              </Stage>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="rounded-xl border bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-stone-400 rounded border border-stone-500"></div>
              <span className="text-gray-600">Desk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Chair/Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <span className="text-gray-600">Seat Count Badge</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-xl border bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Instructions</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            <li><strong>First, select a location</strong> from the dropdown above</li>
            <li>Click a seat count button (1, 2, 3, 4, or 6) to add a desk with that many seats</li>
            <li>Drag desks to position them on the floor plan</li>
            <li>Click a desk to select it, then use "Rotate" or "Delete"</li>
            <li>Click "Save Layout" to make all desks bookable</li>
          </ul>
          <div className="mt-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800">
              <strong>💡 Tip:</strong> The cyan badge on each desk shows how many seats it has. 
              Blue circles represent individual chairs/seats.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
