import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { bookingSchema, type BookingFormData } from '@/lib/validations';
import { useCreateBooking } from '@/hooks/useBookings';
import { getErrorMessage } from '@/lib/utils';
import type { Desk } from '@/types';

interface BookingModalProps {
  desk?: Desk;
  selectedDate: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ desk, selectedDate, isOpen, onClose }: BookingModalProps) {
  const createBooking = useCreateBooking();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      desk_id: desk?.id || '',
      booking_date: selectedDate,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      setError('');
      await createBooking.mutateAsync(data);
      onClose();
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes('DESK_ALREADY_BOOKED_FOR_DATE')) {
        setError('This desk is already booked for the selected date. Please choose another desk.');
      } else if (message.includes('USER_ALREADY_HAS_BOOKING')) {
        setError('You already have a booking for this date. Please cancel it first.');
      } else if (message.includes('DESK_INACTIVE')) {
        setError('This desk is currently inactive and cannot be booked.');
      } else {
        setError(message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Book a Desk</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="desk_id" className="block text-sm font-medium text-gray-700">
              Desk
            </label>
            <input
              {...register('desk_id')}
              id="desk_id"
              type="text"
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm"
              value={desk ? `${desk.name} - ${desk.location}` : ''}
            />
            {errors.desk_id && (
              <p className="mt-1 text-sm text-red-600">{errors.desk_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              {...register('booking_date')}
              id="booking_date"
              type="date"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.booking_date && (
              <p className="mt-1 text-sm text-red-600">{errors.booking_date.message}</p>
            )}
          </div>

          {desk && (
            <div className="rounded-md bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-900">Desk Details:</p>
              <p className="mt-1 text-gray-600">Type: {desk.desk_type}</p>
              {desk.description && <p className="text-gray-600">Description: {desk.description}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

