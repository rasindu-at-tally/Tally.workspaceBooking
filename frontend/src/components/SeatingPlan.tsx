import { useMemo, useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle } from 'react-konva';
import type { Desk, BookingDetail } from '@/types';
import { floorPlansApi, FloorPlanItem } from '@/lib/api/floorPlans';
import { useToast } from '@/components/Toast';

interface SeatingPlanProps {
  desks: Desk[];
  bookings: BookingDetail[];
  onDeskClick: (desk: Desk) => void;
  selectedLocation?: string;
}

type FloorItemWithSeats = FloorPlanItem & {
  seats?: number;
};

// Single Seat Desk Component
function SingleSeatDeskKonva({ 
  item,
  desk,
  isBooked,
  bookedBy,
  onClick
}: { 
  item: FloorItemWithSeats;
  desk?: Desk;
  isBooked: boolean;
  bookedBy?: string;
  onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;
  const width = 80;
  const height = 60;

  const colors = {
    desk: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#22c55e',
    deskTop: !isActive ? '#fecaca' : isBooked ? '#d1d5db' : '#86efac',
    chair: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#16a34a',
    badge: '#06b6d4',
    text: !isActive ? '#991b1b' : isBooked ? '#374151' : '#166534',
  };

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
      opacity={isClickable ? 1 : 0.7}
    >
      {/* Desk surface */}
      <Rect
        width={width}
        height={height}
        fill={colors.desk}
        stroke={isClickable ? '#06b6d4' : '#57534e'}
        strokeWidth={isClickable ? 2 : 1}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      <Rect x={2} y={2} width={width - 4} height={height - 4} fill={colors.deskTop} cornerRadius={3} />
      
      {/* Chair indicator */}
      <Circle x={width / 2} y={height + 14} radius={10} fill={colors.chair} />
      
      {/* Seat count badge */}
      <Circle x={width - 8} y={8} radius={10} fill={colors.badge} />
      <Text x={width - 12} y={3} text="1" fontSize={12} fontStyle="bold" fill="#fff" />
      
      {/* Label */}
      <Text
        x={5}
        y={height / 2 - 14}
        text={desk?.name || item.deskName || 'Desk'}
        fontSize={11}
        fontStyle="bold"
        fill={colors.text}
      />
      
      {/* Booked by */}
      {isBooked && bookedBy && (
        <Text x={5} y={height / 2 + 2} text={bookedBy.substring(0, 10)} fontSize={9} fill="#6b7280" />
      )}
    </Group>
  );
}

// Two Seat Desk Component
function TwoSeatDeskKonva({ 
  item, desk, isBooked, bookedBy, onClick
}: { 
  item: FloorItemWithSeats; desk?: Desk; isBooked: boolean; bookedBy?: string; onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;
  const width = 120;
  const height = 60;

  const colors = {
    desk: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#22c55e',
    deskTop: !isActive ? '#fecaca' : isBooked ? '#d1d5db' : '#86efac',
    chair: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#16a34a',
    badge: '#06b6d4',
    text: !isActive ? '#991b1b' : isBooked ? '#374151' : '#166534',
  };

  return (
    <Group
      x={item.x} y={item.y} rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
      opacity={isClickable ? 1 : 0.7}
    >
      <Rect width={width} height={height} fill={colors.desk} stroke={isClickable ? '#06b6d4' : '#57534e'} strokeWidth={isClickable ? 2 : 1} cornerRadius={4} shadowColor="black" shadowBlur={4} shadowOpacity={0.2} shadowOffset={{ x: 2, y: 2 }} />
      <Rect x={2} y={2} width={width - 4} height={height - 4} fill={colors.deskTop} cornerRadius={3} />
      <Rect x={width / 2 - 0.5} y={5} width={1} height={height - 10} fill={colors.desk} />
      
      {/* Chairs */}
      <Circle x={width / 4} y={height + 14} radius={10} fill={colors.chair} />
      <Circle x={(width / 4) * 3} y={height + 14} radius={10} fill={colors.chair} />
      
      {/* Badge */}
      <Circle x={width - 8} y={8} radius={10} fill={colors.badge} />
      <Text x={width - 12} y={3} text="2" fontSize={12} fontStyle="bold" fill="#fff" />
      
      <Text x={5} y={height / 2 - 14} text={desk?.name || item.deskName || 'Desk'} fontSize={11} fontStyle="bold" fill={colors.text} />
      {isBooked && bookedBy && <Text x={5} y={height / 2 + 2} text={bookedBy.substring(0, 12)} fontSize={9} fill="#6b7280" />}
    </Group>
  );
}

// Three Seat Desk Component
function ThreeSeatDeskKonva({ 
  item, desk, isBooked, bookedBy, onClick
}: { 
  item: FloorItemWithSeats; desk?: Desk; isBooked: boolean; bookedBy?: string; onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;
  const width = 160;
  const height = 60;

  const colors = {
    desk: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#22c55e',
    deskTop: !isActive ? '#fecaca' : isBooked ? '#d1d5db' : '#86efac',
    chair: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#16a34a',
    badge: '#06b6d4',
    text: !isActive ? '#991b1b' : isBooked ? '#374151' : '#166534',
  };

  return (
    <Group
      x={item.x} y={item.y} rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
      opacity={isClickable ? 1 : 0.7}
    >
      <Rect width={width} height={height} fill={colors.desk} stroke={isClickable ? '#06b6d4' : '#57534e'} strokeWidth={isClickable ? 2 : 1} cornerRadius={4} shadowColor="black" shadowBlur={4} shadowOpacity={0.2} shadowOffset={{ x: 2, y: 2 }} />
      <Rect x={2} y={2} width={width - 4} height={height - 4} fill={colors.deskTop} cornerRadius={3} />
      <Rect x={width / 3 - 0.5} y={5} width={1} height={height - 10} fill={colors.desk} />
      <Rect x={(width / 3) * 2 - 0.5} y={5} width={1} height={height - 10} fill={colors.desk} />
      
      {/* Chairs */}
      <Circle x={width / 6} y={height + 14} radius={10} fill={colors.chair} />
      <Circle x={width / 2} y={height + 14} radius={10} fill={colors.chair} />
      <Circle x={(width / 6) * 5} y={height + 14} radius={10} fill={colors.chair} />
      
      {/* Badge */}
      <Circle x={width - 8} y={8} radius={10} fill={colors.badge} />
      <Text x={width - 12} y={3} text="3" fontSize={12} fontStyle="bold" fill="#fff" />
      
      <Text x={5} y={height / 2 - 14} text={desk?.name || item.deskName || 'Desk'} fontSize={11} fontStyle="bold" fill={colors.text} />
      {isBooked && bookedBy && <Text x={5} y={height / 2 + 2} text={bookedBy.substring(0, 16)} fontSize={9} fill="#6b7280" />}
    </Group>
  );
}

// Four Seat Desk Component
function FourSeatDeskKonva({ 
  item, desk, isBooked, bookedBy, onClick
}: { 
  item: FloorItemWithSeats; desk?: Desk; isBooked: boolean; bookedBy?: string; onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;
  const width = 120;
  const height = 80;

  const colors = {
    desk: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#22c55e',
    deskTop: !isActive ? '#fecaca' : isBooked ? '#d1d5db' : '#86efac',
    chair: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#16a34a',
    badge: '#06b6d4',
    text: !isActive ? '#991b1b' : isBooked ? '#374151' : '#166534',
  };

  return (
    <Group
      x={item.x} y={item.y} rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
      opacity={isClickable ? 1 : 0.7}
    >
      <Rect y={18} width={width} height={height} fill={colors.desk} stroke={isClickable ? '#06b6d4' : '#57534e'} strokeWidth={isClickable ? 2 : 1} cornerRadius={4} shadowColor="black" shadowBlur={4} shadowOpacity={0.2} shadowOffset={{ x: 2, y: 2 }} />
      <Rect x={2} y={20} width={width - 4} height={height - 4} fill={colors.deskTop} cornerRadius={3} />
      <Rect x={width / 2 - 0.5} y={23} width={1} height={height - 10} fill={colors.desk} />
      <Rect x={5} y={18 + height / 2 - 0.5} width={width - 10} height={1} fill={colors.desk} />
      
      {/* Top chairs */}
      <Circle x={width / 4} y={6} radius={10} fill={colors.chair} />
      <Circle x={(width / 4) * 3} y={6} radius={10} fill={colors.chair} />
      {/* Bottom chairs */}
      <Circle x={width / 4} y={height + 30} radius={10} fill={colors.chair} />
      <Circle x={(width / 4) * 3} y={height + 30} radius={10} fill={colors.chair} />
      
      {/* Badge */}
      <Circle x={width - 8} y={26} radius={10} fill={colors.badge} />
      <Text x={width - 12} y={21} text="4" fontSize={12} fontStyle="bold" fill="#fff" />
      
      <Text x={5} y={18 + height / 2 - 14} text={desk?.name || item.deskName || 'Desk'} fontSize={11} fontStyle="bold" fill={colors.text} />
      {isBooked && bookedBy && <Text x={5} y={18 + height / 2 + 2} text={bookedBy.substring(0, 12)} fontSize={9} fill="#6b7280" />}
    </Group>
  );
}

// Six Seat Desk Component
function SixSeatDeskKonva({ 
  item, desk, isBooked, bookedBy, onClick
}: { 
  item: FloorItemWithSeats; desk?: Desk; isBooked: boolean; bookedBy?: string; onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;
  const width = 180;
  const height = 70;

  const colors = {
    desk: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#22c55e',
    deskTop: !isActive ? '#fecaca' : isBooked ? '#d1d5db' : '#86efac',
    chair: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#16a34a',
    badge: '#06b6d4',
    text: !isActive ? '#991b1b' : isBooked ? '#374151' : '#166534',
  };

  return (
    <Group
      x={item.x} y={item.y} rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
      opacity={isClickable ? 1 : 0.7}
    >
      <Rect y={18} width={width} height={height} fill={colors.desk} stroke={isClickable ? '#06b6d4' : '#57534e'} strokeWidth={isClickable ? 2 : 1} cornerRadius={4} shadowColor="black" shadowBlur={4} shadowOpacity={0.2} shadowOffset={{ x: 2, y: 2 }} />
      <Rect x={2} y={20} width={width - 4} height={height - 4} fill={colors.deskTop} cornerRadius={3} />
      
      {/* Top chairs */}
      <Circle x={width / 6} y={6} radius={10} fill={colors.chair} />
      <Circle x={width / 2} y={6} radius={10} fill={colors.chair} />
      <Circle x={(width / 6) * 5} y={6} radius={10} fill={colors.chair} />
      {/* Bottom chairs */}
      <Circle x={width / 6} y={height + 30} radius={10} fill={colors.chair} />
      <Circle x={width / 2} y={height + 30} radius={10} fill={colors.chair} />
      <Circle x={(width / 6) * 5} y={height + 30} radius={10} fill={colors.chair} />
      
      {/* Badge */}
      <Circle x={width - 8} y={26} radius={10} fill={colors.badge} />
      <Text x={width - 12} y={21} text="6" fontSize={12} fontStyle="bold" fill="#fff" />
      
      <Text x={5} y={18 + height / 2 - 14} text={desk?.name || item.deskName || 'Desk'} fontSize={11} fontStyle="bold" fill={colors.text} />
      {isBooked && bookedBy && <Text x={5} y={18 + height / 2 + 2} text={bookedBy.substring(0, 18)} fontSize={9} fill="#6b7280" />}
    </Group>
  );
}

// Legacy Desk Component (for old floor plans without seats property)
function LegacyDeskKonva({ 
  item, desk, isBooked, bookedBy, onClick
}: { 
  item: FloorItemWithSeats; desk?: Desk; isBooked: boolean; bookedBy?: string; onClick: () => void;
}) {
  // Fallback to SingleSeatDesk for legacy items
  return <SingleSeatDeskKonva item={item} desk={desk} isBooked={isBooked} bookedBy={bookedBy} onClick={onClick} />;
}

// Legacy Chair Component (for old floor plans)
function LegacyChairKonva({ 
  item, desk, isBooked, bookedBy, onClick
}: { 
  item: FloorItemWithSeats; desk?: Desk; isBooked: boolean; bookedBy?: string; onClick: () => void;
}) {
  const isActive = desk?.is_active ?? true;
  const isClickable = isActive && !isBooked;

  const colors = {
    main: !isActive ? '#ef4444' : isBooked ? '#6b7280' : '#3b82f6',
    light: !isActive ? '#fca5a5' : isBooked ? '#9ca3af' : '#60a5fa',
    stroke: !isActive ? '#dc2626' : isBooked ? '#4b5563' : '#1e40af'
  };

  return (
    <Group
      x={item.x} y={item.y} rotation={item.rotation}
      onClick={isClickable ? onClick : undefined}
      onTap={isClickable ? onClick : undefined}
      opacity={isClickable ? 1 : 0.7}
    >
      {/* Chair backrest */}
      <Rect x={0} y={0} width={40} height={10} fill={colors.main} stroke={colors.stroke} strokeWidth={1} cornerRadius={5} />
      <Rect x={2} y={2} width={36} height={6} fill={colors.light} cornerRadius={3} />
      
      {/* Chair seat */}
      <Rect x={0} y={12} width={40} height={28} fill={colors.main} stroke={colors.stroke} strokeWidth={1} cornerRadius={5} />
      <Rect x={2} y={14} width={36} height={24} fill={colors.light} cornerRadius={3} />
      
      {/* Label */}
      {desk && (
        <Text x={4} y={16} text={desk.name.substring(0, 5)} fontSize={7} fontStyle="bold" fill="#fff" />
      )}
      {isBooked && bookedBy && (
        <Text x={4} y={26} text={bookedBy.substring(0, 5)} fontSize={6} fill="#e5e7eb" />
      )}
    </Group>
  );
}

export function SeatingPlan({ desks, bookings, onDeskClick, selectedLocation }: SeatingPlanProps) {
  const [floorPlanItems, setFloorPlanItems] = useState<FloorItemWithSeats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFloorPlan, setHasFloorPlan] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const bookedDeskIds = useMemo(() => {
    return new Set(bookings.map((b) => b.desk_id));
  }, [bookings]);

  const bookingByDeskId = useMemo(() => {
    const map = new Map<string, BookingDetail>();
    bookings.forEach((b) => map.set(b.desk_id, b));
    return map;
  }, [bookings]);

  const deskMap = useMemo(() => {
    const map = new Map<string, Desk>();
    desks.forEach(desk => map.set(desk.name, desk));
    return map;
  }, [desks]);

  useEffect(() => {
    const updateScale = () => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const containerWidth = container.offsetWidth;
      const targetWidth = 1800;
      if (!containerWidth) return;
      const scale = Math.min(containerWidth / targetWidth, 1);
      setStageScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const loadFloorPlan = async () => {
      if (!selectedLocation) {
        setHasFloorPlan(false);
        return;
      }

      setIsLoading(true);
      try {
        const floorPlan = await floorPlansApi.getByLocation(selectedLocation);
        const items: FloorItemWithSeats[] = JSON.parse(floorPlan.layout_data);
        setFloorPlanItems(items);
        setHasFloorPlan(true);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setHasFloorPlan(false);
          setFloorPlanItems([]);
        } else {
          console.error('[SeatingPlan] Error loading floor plan:', error);
          setHasFloorPlan(false);
          showToast({
            type: 'error',
            message: 'Something went wrong loading the seating plan. Please try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFloorPlan();
  }, [selectedLocation, showToast]);

  const totalSeats = floorPlanItems.reduce((sum, item) => sum + (item.seats || 1), 0);
  const availableDesks = floorPlanItems.filter(item => {
    const desk = item.deskName ? deskMap.get(item.deskName) : undefined;
    return desk && !bookedDeskIds.has(desk.id) && desk.is_active;
  }).length;

  const renderDeskItem = (item: FloorItemWithSeats) => {
    const desk = item.deskName ? deskMap.get(item.deskName) : undefined;
    const isBooked = desk ? bookedDeskIds.has(desk.id) : false;
    const booking = desk ? bookingByDeskId.get(desk.id) : undefined;
    const bookedBy = booking?.user?.full_name || booking?.user?.email || undefined;
    
    const handleClick = () => {
      if (desk) {
        onDeskClick(desk);
      } else {
        showToast({
          type: 'info',
          message: `This desk is not available for booking. Please contact an administrator.`,
        });
      }
    };

    const props = { item, desk, isBooked, bookedBy, onClick: handleClick };
    const seats = item.seats || 1;

    // Handle legacy chair type
    if (item.type === 'chair') {
      return <LegacyChairKonva key={item.id} {...props} />;
    }

    // Render based on seat count
    switch (seats) {
      case 1: return <SingleSeatDeskKonva key={item.id} {...props} />;
      case 2: return <TwoSeatDeskKonva key={item.id} {...props} />;
      case 3: return <ThreeSeatDeskKonva key={item.id} {...props} />;
      case 4: return <FourSeatDeskKonva key={item.id} {...props} />;
      case 6: return <SixSeatDeskKonva key={item.id} {...props} />;
      default: return <LegacyDeskKonva key={item.id} {...props} />;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Office Seating Plan</h2>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (!hasFloorPlan || floorPlanItems.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Office Seating Plan</h2>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-8 text-center">
          <p className="text-amber-800 font-medium">No floor plan available for this location</p>
          <p className="text-amber-700 text-sm mt-2">Please contact an administrator to set up the floor plan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Office Seating Plan</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1">
            <span className="font-medium text-cyan-700">{floorPlanItems.length} Desks</span>
          </span>
          <span className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
            <span className="font-medium text-blue-700">{totalSeats} Seats</span>
          </span>
          <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1">
            <span className="font-medium text-emerald-700">{availableDesks} Available</span>
          </span>
        </div>
      </div>
      
      {/* Canvas Floor Plan */}
      <div
        ref={canvasContainerRef}
        className="bg-gray-100 rounded-xl p-2 sm:p-4 overflow-auto"
        style={{ maxHeight: '600px' }}
      >
        <Stage
          width={1800}
          height={900}
          scaleX={stageScale}
          scaleY={stageScale}
        >
          <Layer>
            {/* Grid background */}
            {Array.from({ length: 36 }).map((_, i) => (
              <Rect key={`v-${i}`} x={i * 50} y={0} width={1} height={900} fill="#e5e7eb" />
            ))}
            {Array.from({ length: 18 }).map((_, i) => (
              <Rect key={`h-${i}`} x={0} y={i * 50} width={1800} height={1} fill="#e5e7eb" />
            ))}

            {/* Render floor plan items */}
            {floorPlanItems.map(item => renderDeskItem(item))}
          </Layer>
        </Stage>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-green-500 rounded border-2 border-cyan-500"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-gray-400 rounded border border-gray-500"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-red-300 rounded border border-red-400"></div>
          <span className="text-gray-600">Inactive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded-full"></div>
          <span className="text-gray-600">Chair/Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
          <span className="text-gray-600">Seat Count</span>
        </div>
      </div>
    </div>
  );
}
