import { useMemo } from 'react';
import type { Desk, BookingDetail } from '@/types';

interface SeatingPlanProps {
  desks: Desk[];
  bookings: BookingDetail[];
  onDeskClick: (desk: Desk) => void;
}

interface SeatProps {
  desk: Desk;
  isBooked: boolean;
  onClick: () => void;
  rotation?: number; // 0 = facing up, 90 = right, 180 = down, 270 = left
}

function Seat({ desk, isBooked, onClick, rotation = 0 }: SeatProps) {
  const getStatusColors = () => {
    if (!desk.is_active) return {
      seat: '#fecaca',
      seatBorder: '#ef4444',
      back: '#dc2626',
      text: '#991b1b'
    };
    if (isBooked) return {
      seat: '#e5e7eb',
      seatBorder: '#9ca3af',
      back: '#6b7280',
      text: '#374151'
    };
    return {
      seat: '#bbf7d0',
      seatBorder: '#22c55e',
      back: '#16a34a',
      text: '#15803d'
    };
  };

  const colors = getStatusColors();
  const isClickable = desk.is_active && !isBooked;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`
        relative w-14 h-14 transition-all
        ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
      `}
      title={`${desk.name} - ${desk.desk_type} - ${!desk.is_active ? 'Inactive' : isBooked ? 'Booked' : 'Available'}`}
    >
      <svg 
        viewBox="0 0 60 60" 
        className="w-full h-full"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Chair backrest */}
        <rect
          x="10"
          y="8"
          width="40"
          height="8"
          rx="4"
          fill={colors.back}
          stroke={colors.seatBorder}
          strokeWidth="1.5"
        />
        
        {/* Chair seat */}
        <rect
          x="8"
          y="18"
          width="44"
          height="32"
          rx="6"
          fill={colors.seat}
          stroke={colors.seatBorder}
          strokeWidth="2"
        />
        
        {/* Shadow/depth */}
        <ellipse
          cx="30"
          cy="50"
          rx="18"
          ry="3"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Desk label */}
        <text
          x="30"
          y="36"
          textAnchor="middle"
          style={{ 
            fontSize: '9px', 
            fontWeight: 'bold',
            fill: colors.text,
            transform: `rotate(-${rotation}deg)`,
            transformOrigin: '30px 36px'
          }}
        >
          {desk.name}
        </text>
      </svg>
    </button>
  );
}

export function SeatingPlan({ desks, bookings, onDeskClick }: SeatingPlanProps) {
  const bookedDeskIds = useMemo(() => {
    return new Set(bookings.map((b) => b.desk_id));
  }, [bookings]);

  // Organize desks into sections
  const layout = useMemo(() => {
    const sorted = [...desks].sort((a, b) => {
      if (a.position_x !== b.position_x) return a.position_x - b.position_x;
      return a.position_y - b.position_y;
    });

    // Based on the image: 3+3 left, 2 center vertical, 3+3 right
    return {
      leftTopRow1: sorted.slice(0, 6),
      leftTopRow2: sorted.slice(6, 12),
      leftTopRow3: sorted.slice(12, 18),
      leftBottomRow1: sorted.slice(18, 24),
      leftBottomRow2: sorted.slice(24, 30),
      leftBottomRow3: sorted.slice(30, 36),
      centerLeft: sorted.slice(36, 44),
      centerRight: sorted.slice(44, 52),
      rightTopRow1: sorted.slice(52, 58),
      rightTopRow2: sorted.slice(58, 64),
      rightTopRow3: sorted.slice(64, 70),
      rightBottomRow1: sorted.slice(70, 76),
      rightBottomRow2: sorted.slice(76, 82),
      rightBottomRow3: sorted.slice(82, 88),
    };
  }, [desks]);

  const renderHorizontalTable = (seats: Desk[]) => {
    if (seats.length === 0) return null;
    
    const topSeats = seats.slice(0, 3);
    const bottomSeats = seats.slice(3, 6);
    
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Top row of seats - facing down toward table */}
        <div className="flex gap-1">
          {topSeats.map((desk) => (
            <Seat
              key={desk.id}
              desk={desk}
              isBooked={bookedDeskIds.has(desk.id)}
              onClick={() => onDeskClick(desk)}
              rotation={180}
            />
          ))}
        </div>
        
        {/* Table */}
        <div className="w-full h-16 bg-slate-100 border-2 border-slate-300 rounded-lg shadow-sm"></div>
        
        {/* Bottom row of seats - facing up toward table */}
        <div className="flex gap-1">
          {bottomSeats.map((desk) => (
            <Seat
              key={desk.id}
              desk={desk}
              isBooked={bookedDeskIds.has(desk.id)}
              onClick={() => onDeskClick(desk)}
              rotation={0}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderVerticalTable = (seats: Desk[]) => {
    if (seats.length === 0) return null;
    
    const leftSeats = seats.slice(0, 4);
    const rightSeats = seats.slice(4, 8);
    
    return (
      <div className="flex items-center gap-1">
        {/* Left column of seats - facing right toward table */}
        <div className="flex flex-col gap-1">
          {leftSeats.map((desk) => (
            <Seat
              key={desk.id}
              desk={desk}
              isBooked={bookedDeskIds.has(desk.id)}
              onClick={() => onDeskClick(desk)}
              rotation={90}
            />
          ))}
        </div>
        
        {/* Table */}
        <div className="w-20 h-full bg-slate-100 border-2 border-slate-300 rounded-lg shadow-sm"></div>
        
        {/* Right column of seats - facing left toward table */}
        <div className="flex flex-col gap-1">
          {rightSeats.map((desk) => (
            <Seat
              key={desk.id}
              desk={desk}
              isBooked={bookedDeskIds.has(desk.id)}
              onClick={() => onDeskClick(desk)}
              rotation={270}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Office Seating Plan</h2>
      
      {/* Floor Plan Layout */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 overflow-auto">
        <div className="grid grid-cols-[auto_auto_auto] gap-12 justify-center min-w-max">
          
          {/* LEFT SECTION */}
          <div className="flex flex-col gap-8">
            {/* Top 3 tables */}
            <div className="flex flex-col gap-4">
              {renderHorizontalTable(layout.leftTopRow1)}
              {renderHorizontalTable(layout.leftTopRow2)}
              {renderHorizontalTable(layout.leftTopRow3)}
            </div>
            
            {/* Bottom 3 tables */}
            <div className="flex flex-col gap-4 mt-8">
              {renderHorizontalTable(layout.leftBottomRow1)}
              {renderHorizontalTable(layout.leftBottomRow2)}
              {renderHorizontalTable(layout.leftBottomRow3)}
            </div>
          </div>
          
          {/* CENTER SECTION */}
          <div className="flex gap-8 items-start pt-12">
            {renderVerticalTable(layout.centerLeft)}
            {renderVerticalTable(layout.centerRight)}
          </div>
          
          {/* RIGHT SECTION */}
          <div className="flex flex-col gap-8">
            {/* Top 3 tables */}
            <div className="flex flex-col gap-4">
              {renderHorizontalTable(layout.rightTopRow1)}
              {renderHorizontalTable(layout.rightTopRow2)}
              {renderHorizontalTable(layout.rightTopRow3)}
            </div>
            
            {/* Bottom 3 tables */}
            <div className="flex flex-col gap-4 mt-8">
              {renderHorizontalTable(layout.rightBottomRow1)}
              {renderHorizontalTable(layout.rightBottomRow2)}
              {renderHorizontalTable(layout.rightBottomRow3)}
            </div>
          </div>
          
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-100 border-2 border-green-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-200 border-2 border-gray-400"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-100 border-2 border-red-400"></div>
          <span>Inactive</span>
        </div>
      </div>
    </div>
  );
}

