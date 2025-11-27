import { useState } from 'react';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout';
import { SeatingPlan } from '@/components/SeatingPlan';
import { BookingModal } from '@/components/BookingModal';
import { useDesks, useLocations } from '@/hooks/useDesks';
import { useBookingsByDate } from '@/hooks/useBookings';
import type { Desk } from '@/types';

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDesk, setSelectedDesk] = useState<Desk | undefined>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: locations = [] } = useLocations();
  const { data: desks = [], isLoading: desksLoading } = useDesks(
    selectedLocation || undefined,
    true
  );
  const { data: bookings = [], isLoading: bookingsLoading } = useBookingsByDate(
    selectedDate,
    'active'
  );

  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDesk(undefined);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-cyan-600">Book a Desk</h1>
          <p className="mt-2 text-gray-600">
            Select a date and location to view available desks
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seating Plan */}
        {desksLoading || bookingsLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : desks.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-600">No desks available for the selected filters</p>
          </div>
        ) : (
          <SeatingPlan 
            desks={desks} 
            bookings={bookings} 
            onDeskClick={handleDeskClick}
            selectedLocation={selectedLocation}
          />
        )}

        {/* Booking Modal */}
        <BookingModal
          desk={selectedDesk}
          selectedDate={selectedDate}
          isOpen={isBookingModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </Layout>
  );
}

