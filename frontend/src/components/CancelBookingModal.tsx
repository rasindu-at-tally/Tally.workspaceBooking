import { useState, useEffect } from 'react';
import { XCircle, AlertTriangle, X, Calendar, MapPin, Clock } from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
  bookingType: 'desk' | 'room';
  bookingDetails?: {
    name: string;
    date?: string;
    time?: string;
    location?: string;
  };
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  bookingType,
  bookingDetails,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState('');

  // Reset reason when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-slate-800 mb-2">
          Cancel {bookingType === 'desk' ? 'Desk' : 'Room'} Booking?
        </h2>

        {/* Description */}
        <p className="text-center text-slate-500 mb-4">
          This action cannot be undone. The {bookingType} will become available for others to book.
        </p>

        {/* Booking Details Card */}
        {bookingDetails && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-5">
            <h3 className="font-semibold text-slate-800 mb-3">{bookingDetails.name}</h3>
            <div className="space-y-2 text-sm text-slate-600">
              {bookingDetails.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{bookingDetails.date}</span>
                </div>
              )}
              {bookingDetails.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{bookingDetails.time}</span>
                </div>
              )}
              {bookingDetails.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{bookingDetails.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason Input */}
        <div className="mb-5">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-slate-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Meeting rescheduled, Working from home..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Cancel Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

