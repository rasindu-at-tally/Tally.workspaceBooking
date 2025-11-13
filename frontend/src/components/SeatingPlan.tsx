import { useMemo, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import type { Desk, BookingDetail } from '@/types';
import { floorPlansApi, FloorPlanItem } from '@/lib/api/floorPlans';

interface SeatingPlanProps {
  desks: Desk[];
  bookings: BookingDetail[];
  onDeskClick: (desk: Desk) => void;
  selectedLocation?: string;
}

// Desk Component for Floor Plan
function DeskKonva({ 
  item,
  desk,
  isBooked,
  onClick
}: { 
  item: FloorPlanItem;
  desk?: Desk;
  isBooked: boolean;
  onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;
  const isSelected = false; // Can add selection state later

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
    >
      {/* Desk surface */}
      <Rect
        width={120}
        height={80}
        fill={!isActive ? '#fca5a5' : isBooked ? '#d1d5db' : '#8B7355'}
        stroke={isSelected ? '#3b82f6' : '#654321'}
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={6}
        shadowOpacity={0.3}
        shadowOffset={{ x: 2, y: 2 }}
        cornerRadius={8}
        opacity={isClickable ? 1 : 0.6}
      />
      <Rect
        x={4}
        y={4}
        width={112}
        height={72}
        fill={!isActive ? '#fecaca' : isBooked ? '#e5e7eb' : '#A0826D'}
        cornerRadius={6}
      />
      {/* Drawers */}
      <Rect
        x={20}
        y={50}
        width={35}
        height={12}
        fill="#654321"
        cornerRadius={3}
      />
      <Rect
        x={65}
        y={50}
        width={35}
        height={12}
        fill="#654321"
        cornerRadius={3}
      />
      {/* Label */}
      <Text
        x={10}
        y={18}
        text={desk?.name || item.deskName || 'Desk'}
        fontSize={14}
        fontStyle="bold"
        fill="#fff"
      />
    </Group>
  );
}

// Chair Component for Floor Plan
function ChairKonva({ 
  item,
  desk,
  isBooked,
  onClick
}: { 
  item: FloorPlanItem;
  desk?: Desk;
  isBooked: boolean;
  onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;

  const colors = {
    main: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#2563eb',
    light: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#60a5fa',
    stroke: !isActive ? '#dc2626' : isBooked ? '#4b5563' : '#1e40af'
  };

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
    >
      {/* Chair backrest */}
      <Rect
        x={0}
        y={0}
        width={45}
        height={12}
        fill={colors.main}
        stroke={colors.stroke}
        strokeWidth={2}
        cornerRadius={6}
        shadowColor="black"
        shadowBlur={3}
        shadowOpacity={0.3}
        opacity={isClickable ? 1 : 0.6}
      />
      <Rect
        x={3}
        y={2}
        width={39}
        height={8}
        fill={colors.light}
        cornerRadius={4}
      />
      {/* Chair seat */}
      <Rect
        x={0}
        y={14}
        width={45}
        height={32}
        fill={colors.main}
        stroke={colors.stroke}
        strokeWidth={2}
        cornerRadius={6}
        shadowColor="black"
        shadowBlur={3}
        shadowOpacity={0.3}
      />
      <Rect
        x={3}
        y={17}
        width={39}
        height={26}
        fill={colors.light}
        cornerRadius={4}
      />
      {/* Label */}
      {desk && (
        <Text
          x={5}
          y={28}
          text={desk.name}
          fontSize={8}
          fontStyle="bold"
          fill="#fff"
        />
      )}
    </Group>
  );
}

export function SeatingPlan({ desks, bookings, onDeskClick, selectedLocation }: SeatingPlanProps) {
  const [floorPlanItems, setFloorPlanItems] = useState<FloorPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFloorPlan, setHasFloorPlan] = useState(false);

  const bookedDeskIds = useMemo(() => {
    return new Set(bookings.map((b) => b.desk_id));
  }, [bookings]);

  // Create a map of desk names to desk objects
  const deskMap = useMemo(() => {
    const map = new Map<string, Desk>();
    desks.forEach(desk => map.set(desk.name, desk));
    return map;
  }, [desks]);

  // Load floor plan for the selected location
  useEffect(() => {
    const loadFloorPlan = async () => {
      if (!selectedLocation) {
        setHasFloorPlan(false);
        return;
      }

      setIsLoading(true);
      try {
        const floorPlan = await floorPlansApi.getByLocation(selectedLocation);
        const items: FloorPlanItem[] = JSON.parse(floorPlan.layout_data);
        setFloorPlanItems(items);
        setHasFloorPlan(true);
      } catch (error: any) {
        if (error.response?.status === 404) {
          // No floor plan for this location
          setHasFloorPlan(false);
          setFloorPlanItems([]);
        } else {
          console.error('[SeatingPlan] Error loading floor plan:', error);
          setHasFloorPlan(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFloorPlan();
  }, [selectedLocation]);

  // Render the floor plan if available
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Office Seating Plan</h2>
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-gray-600">Loading floor plan...</div>
            </div>
          </div>
    );
  }

  if (!hasFloorPlan || floorPlanItems.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Office Seating Plan</h2>
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-8 text-center">
          <p className="text-yellow-800 font-medium">No floor plan available for this location</p>
          <p className="text-yellow-700 text-sm mt-2">Please contact an administrator to set up the floor plan</p>
        </div>
    </div>
  );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Office Seating Plan</h2>
      
      {/* Canvas Floor Plan */}
      <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
        <Stage width={1800} height={900}>
          <Layer>
            {/* Grid background */}
            {Array.from({ length: 36 }).map((_, i) => (
              <Rect
                key={`v-${i}`}
                x={i * 50}
                y={0}
                width={1}
                height={900}
                fill="#e5e7eb"
              />
            ))}
            {Array.from({ length: 18 }).map((_, i) => (
              <Rect
                key={`h-${i}`}
                x={0}
                y={i * 50}
                width={1800}
                height={1}
                fill="#e5e7eb"
              />
            ))}

            {/* Render floor plan items */}
            {floorPlanItems.map((item) => {
              const desk = item.deskName ? deskMap.get(item.deskName) : undefined;
              const isBooked = desk ? bookedDeskIds.has(desk.id) : false;
              
              const handleClick = () => {
                if (desk) {
                  onDeskClick(desk);
                } else {
                  alert(`This ${item.type} is not available for booking. Please contact admin.`);
                }
              };
              
              if (item.type === 'desk') {
                return (
                  <DeskKonva
                    key={item.id}
                    item={item}
                    desk={desk}
                    isBooked={isBooked}
                    onClick={handleClick}
                  />
                );
              } else {
                return (
                  <ChairKonva
                    key={item.id}
                    item={item}
                    desk={desk}
                    isBooked={isBooked}
                    onClick={handleClick}
                  />
                );
              }
            })}
          </Layer>
        </Stage>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-blue-400 border-2 border-blue-600"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-400 border-2 border-gray-600"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-400 border-2 border-red-600"></div>
          <span>Inactive</span>
        </div>
      </div>
    </div>
  );
}

