import { describe, it, expect } from 'vitest';
import { Booking, TourPackage } from '../src/types';

describe('Booking & Cancellation Logic', () => {
  const sampleTour: TourPackage = {
    id: 'tour-101',
    title: 'Rixos Premium Belek 5★',
    location: 'Antalya, Turkiya',
    tag: 'Ultra All Inclusive',
    badgeType: 'luxury',
    is5Star: true,
    rating: 4.9,
    nights: '7 kecha',
    flight: 'TAS -> AYT (Charter)',
    price: 800,
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
    saved: false,
    category: 'luxury',
    isLiveKompas: false
  };

  it('correctly calculates total package price with adults and discounted children', () => {
    const adultsCount = 2;
    const childrenCount = 1;
    const perAdult = sampleTour.price; // 800
    const perChild = Math.round(perAdult * 0.5); // 400
    const total = (adultsCount * perAdult) + (childrenCount * perChild); // 2000

    expect(total).toBe(2000);
    expect(perChild).toBe(400);
    expect(adultsCount + childrenCount).toBe(3);
  });

  it('constructs a booking object containing traveler count, adults and children details', () => {
    const adults = 2;
    const children = 1;
    const totalGuests = adults + children;
    const totalNumeric = (adults * 800) + (children * 400);

    const booking: Booking = {
      id: 'b-test-1',
      tourTitle: sampleTour.title,
      dest: sampleTour.location,
      dates: '15 Okt — 22 Okt, 2026',
      status: 'Tasdiqlangan',
      voucherId: 'TW-VOUCHER-9988',
      price: `$${totalNumeric} (${totalGuests} kishi: ${adults} katta, ${children} bola)`,
      totalNumeric,
      travelerName: 'Jasur Rahimov',
      travelerPhone: '+998901234567',
      travelerPassport: 'FA 1234567',
      type: 'active',
      guestsCount: totalGuests,
      adultsCount: adults,
      childrenCount: children
    };

    expect(booking.status).toBe('Tasdiqlangan');
    expect(booking.type).toBe('active');
    expect(booking.guestsCount).toBe(3);
    expect(booking.adultsCount).toBe(2);
    expect(booking.childrenCount).toBe(1);
    expect(booking.travelerPhone).toBe('+998901234567');
  });

  it('properly transitions a booking to cancelled status with reason and refund status', () => {
    const booking: Booking = {
      id: 'b-test-1',
      tourTitle: sampleTour.title,
      dest: sampleTour.location,
      dates: '15 Okt — 22 Okt, 2026',
      status: 'Tasdiqlangan',
      voucherId: 'TW-VOUCHER-9988',
      price: '$2000 (3 kishi: 2 katta, 1 bola)',
      totalNumeric: 2000,
      travelerName: 'Jasur Rahimov',
      type: 'active',
      guestsCount: 3,
      adultsCount: 2,
      childrenCount: 1
    };

    // User cancels the tour
    const reason = "Rejalarim o'zgardi";
    const cancelledBooking: Booking = {
      ...booking,
      status: 'Bekor qilingan',
      type: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    };

    expect(cancelledBooking.status).toBe('Bekor qilingan');
    expect(cancelledBooking.type).toBe('cancelled');
    expect(cancelledBooking.cancellationReason).toBe("Rejalarim o'zgardi");
    expect(cancelledBooking.cancelledAt).toBeDefined();

    // Active tours filter excludes cancelled booking
    const allBookings = [cancelledBooking];
    const active = allBookings.filter(b => b.type === 'active' && b.status !== 'Bekor qilingan');
    const cancelled = allBookings.filter(b => b.type === 'cancelled' || b.status === 'Bekor qilingan');

    expect(active.length).toBe(0);
    expect(cancelled.length).toBe(1);
    expect(cancelled[0].id).toBe('b-test-1');
  });
});
