import { DriverStats, RideRequest, RideStatus, VehicleType } from '../types';
import { defaultApiClient } from '../api/apiClient';

export interface IDriverRepository {
  getDriverStats(driverId: string): Promise<DriverStats>;
  setOnlineStatus(driverId: string, isOnline: boolean): Promise<boolean>;
  getPendingRequest(driverId: string): Promise<RideRequest | null>;
  acceptRide(rideId: string, driverId: string): Promise<RideRequest | null>;
  declineRide(rideId: string, driverId: string): Promise<boolean>;
  notifyArrivedAtPickup(rideId: string): Promise<boolean>;
  startRide(rideId: string, pin: string): Promise<RideRequest | null>;
  completeRide(rideId: string): Promise<{ totalEarnings: number; rideId: string }>;
}

const readNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeVehicleType = (raw: any): VehicleType => {
  const value = String(raw || '').toLowerCase();
  if (value === 'bike') return 'bike';
  if (value === 'scooty') return 'scooty';
  if (value === 'auto') return 'auto';
  return 'car';
};

const unwrapApiData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>) && (payload as any).data !== undefined) {
    return (payload as any).data as T;
  }
  return payload as T;
};

const mapRideFromApi = (ride: any): RideRequest => ({
  id: String(ride.id ?? 'ride-demo'),
  customerId: String(ride.customerId ?? ride.customer_id ?? 'demo_customer'),
  customerName: ride.customerName ?? ride.customer_name ?? 'Demo Customer',
  customerPhone: ride.customerPhone ?? ride.customer_phone ?? '+91 99900 00001',
  customerRating: readNumber(ride.customerRating ?? ride.customer_rating ?? 5),
  customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  pickupAddress: ride.pickupAddress ?? ride.pickup_address ?? 'Pickup',
  pickupCoords: {
    lat: readNumber(ride.pickupLat ?? ride.pickup_lat ?? 12.9716),
    lng: readNumber(ride.pickupLng ?? ride.pickup_lng ?? 77.5946)
  },
  destinationAddress: ride.destinationAddress ?? ride.destination_address ?? 'Destination',
  destinationCoords: {
    lat: readNumber(ride.destinationLat ?? ride.destination_lat ?? 13.0068),
    lng: readNumber(ride.destinationLng ?? ride.destination_lng ?? 77.5545)
  },
  distanceKm: readNumber(ride.distanceKm ?? ride.distance_km ?? 10),
  travelTimeMins: readNumber(ride.travelTimeMins ?? ride.travel_time_mins ?? 25),
  vehicleType: normalizeVehicleType(ride.vehicleType?.name ?? ride.vehicle_type?.name ?? 'car'),
  ratePerKm: readNumber(ride.vehicleType?.ratePerKm ?? ride.vehicle_type?.ratePerKm ?? ride.vehicle_type?.rate_per_km ?? 25),
  baseFare: 0,
  distanceFare: readNumber(ride.distanceFare ?? ride.distance_fare ?? ride.estimatedFare ?? ride.estimated_fare ?? 0),
  taxesAndFees: 0,
  totalFare: readNumber(ride.totalFare ?? ride.total_fare ?? ride.estimatedFare ?? ride.estimated_fare ?? 0),
  pin: String(ride.otp ?? ride.otp_code ?? '1234'),
  status: ride.status === 'RIDE_STARTED' ? RideStatus.IN_PROGRESS : ride.status === 'DRIVER_ARRIVED' ? RideStatus.ARRIVED_AT_PICKUP : ride.status === 'COMPLETED' ? RideStatus.COMPLETED : RideStatus.ACCEPTED,
  createdAt: ride.createdAt ?? ride.created_at ?? new Date().toISOString(),
  driver: ride.driver ? {
    id: String(ride.driver.id ?? 'drv-demo'),
    name: ride.driver.name ?? 'Demo Driver',
    rating: readNumber(ride.driver.rating ?? 4.8),
    totalRides: 0,
    vehicleModel: ride.driver.vehicleType?.name ?? ride.driver.vehicle_type?.name ?? 'Swift Dzire',
    vehiclePlate: ride.driver.vehicleNumber ?? ride.driver.vehicle_number ?? 'KA-01-AB-1234',
    vehicleColor: 'White',
    vehicleType: normalizeVehicleType(ride.driver.vehicleType?.name ?? ride.driver.vehicle_type?.name ?? 'car'),
    phone: ride.driver.phone ?? '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currentCoords: {
      lat: readNumber(ride.driver.currentLat ?? ride.driver.current_lat ?? 12.9352),
      lng: readNumber(ride.driver.currentLng ?? ride.driver.current_lng ?? 77.6245)
    }
  } : undefined
});

export class DriverRepository implements IDriverRepository {
  async getDriverStats(driverId: string): Promise<DriverStats> {
    try {
      const response = unwrapApiData<any>(await defaultApiClient.get(`/driver/earnings/?driverId=${driverId}`));
      const totalRides = Number(response.totalRides ?? response.total_rides ?? response.totalRidesCount ?? response.total_rides_count ?? 0);
      const totalEarnings = Number(response.totalEarnings ?? response.total_earnings ?? response.todayEarnings ?? response.today_earnings ?? 0);
      const recent = Array.isArray(response.recentRides) ? response.recentRides : [];
      return {
        isOnline: Boolean(response.isOnline ?? response.is_online ?? false),
        todayEarnings: Number(response.todayEarnings ?? response.today_earnings ?? totalEarnings),
        yesterdayChangePct: 12,
        weeklyEarnings: Number(response.weeklyEarnings ?? response.weekly_earnings ?? totalEarnings),
        totalRidesCount: totalRides,
        hoursOnline: Number(response.hoursOnline ?? response.hours_online ?? 0),
        weeklyTrend: Array.isArray(response.weeklyTrend) && response.weeklyTrend.length ? response.weeklyTrend.map((item: any) => ({ day: item.day ?? 'M', amount: Number(item.amount ?? 0), isHighlight: Boolean(item.isHighlight ?? item.is_highlight) })) : [
          { day: 'M', amount: 35 },
          { day: 'T', amount: 65 },
          { day: 'W', amount: 50 },
          { day: 'T', amount: 95 },
          { day: 'F', amount: 142, isHighlight: true },
          { day: 'S', amount: 25 },
          { day: 'S', amount: 15 }
        ],
        recentRides: recent.length ? recent.map((ride: any) => ({
          id: String(ride.id ?? 'ride'),
          title: ride.title ?? ride.pickupAddress ?? 'Ride',
          subtext: ride.subtext ?? `${ride.createdAt ?? 'Today'} • ${ride.distanceKm ?? 0} km`,
          distance: String(ride.distanceKm ?? ride.distance_km ?? '0 km'),
          amount: Number(ride.amount ?? ride.finalFare ?? ride.estimatedFare ?? 0),
          status: ride.status === 'Cancelled' ? 'Cancelled' : 'Completed'
        })) : [
          { id: 'rec-1', title: 'Downtown to Airport', subtext: 'Today, 2:45 PM • 12.4 mi', distance: '12.4 mi', amount: 34.5, status: 'Completed' },
          { id: 'rec-2', title: 'Uptown to Central Sta.', subtext: 'Today, 11:30 AM • 4.2 mi', distance: '4.2 mi', amount: 14.2, status: 'Completed' },
          { id: 'rec-3', title: 'Westside Mall to Home', subtext: 'Today, 9:15 AM • 8.7 mi', distance: '8.7 mi', amount: 22.8, status: 'Completed' }
        ]
      };
    } catch {
      return {
        isOnline: false,
        todayEarnings: 0,
        yesterdayChangePct: 0,
        weeklyEarnings: 0,
        totalRidesCount: 0,
        hoursOnline: 0,
        weeklyTrend: [
          { day: 'M', amount: 0 },
          { day: 'T', amount: 0 },
          { day: 'W', amount: 0 },
          { day: 'T', amount: 0 },
          { day: 'F', amount: 0, isHighlight: true },
          { day: 'S', amount: 0 },
          { day: 'S', amount: 0 }
        ],
        recentRides: []
      };
    }
  }

  async setOnlineStatus(driverId: string, isOnline: boolean): Promise<boolean> {
    try {
      await defaultApiClient.patch('/driver/status/', { driverId, isOnline, is_online: isOnline });
      return true;
    } catch {
      return false;
    }
  }

  async getPendingRequest(driverId: string): Promise<RideRequest | null> {
    try {
      const response = await defaultApiClient.get<any>(`/driver/requests/?driverId=${driverId}`);
      const ride = unwrapApiData<any>(response);
      return ride && ride.id ? mapRideFromApi(ride) : null;
    } catch {
      return null;
    }
  }

  async acceptRide(rideId: string, driverId: string): Promise<RideRequest | null> {
    try {
      const response = await defaultApiClient.post<any>(`/driver/rides/${rideId}/accept/`, { driverId, driver_id: driverId });
      const ride = unwrapApiData<any>(response);
      return ride && ride.id ? mapRideFromApi(ride) : null;
    } catch {
      return null;
    }
  }

  async declineRide(rideId: string, driverId: string): Promise<boolean> {
    try {
      await defaultApiClient.post(`/driver/rides/${rideId}/decline/`, { driverId, driver_id: driverId });
      return true;
    } catch {
      return false;
    }
  }

  async notifyArrivedAtPickup(rideId: string): Promise<boolean> {
    try {
      await defaultApiClient.post(`/driver/rides/${rideId}/arrived/`, {});
      return true;
    } catch {
      return false;
    }
  }

  async startRide(rideId: string, pin: string): Promise<RideRequest | null> {
    try {
      const response = await defaultApiClient.post<any>(`/driver/rides/${rideId}/start/`, { otp: pin, driverId: 'demo_driver' });
      const ride = unwrapApiData<any>(response);
      return ride && ride.id ? mapRideFromApi({ ...ride, status: 'RIDE_STARTED' }) : null;
    } catch {
      return null;
    }
  }

  async completeRide(rideId: string): Promise<{ totalEarnings: number; rideId: string }> {
    try {
      const response = await defaultApiClient.post<any>(`/driver/rides/${rideId}/complete/`, { driverId: 'demo_driver' });
      const payload = unwrapApiData<any>(response);
      return {
        totalEarnings: readNumber(payload.totalEarnings ?? payload.total_earnings ?? payload.finalFare ?? payload.final_fare ?? payload.estimatedFare ?? payload.estimated_fare ?? 0),
        rideId
      };
    } catch {
      return { totalEarnings: 0, rideId };
    }
  }
}

export const defaultDriverRepository = new DriverRepository();

export const driverRepository = {
  getStats: async (): Promise<DriverStats> => defaultDriverRepository.getDriverStats('demo_driver'),
  setOnline: async (isOnline: boolean): Promise<boolean> => defaultDriverRepository.setOnlineStatus('demo_driver', isOnline),
  acceptRide: async (rideId: string): Promise<RideRequest | null> => defaultDriverRepository.acceptRide(rideId, 'demo_driver'),
  declineRide: async (rideId: string): Promise<boolean> => defaultDriverRepository.declineRide(rideId, 'demo_driver'),
  startRide: async (rideId: string, pin: string): Promise<RideRequest | null> => defaultDriverRepository.startRide(rideId, pin),
  getPendingRequest: async (): Promise<RideRequest | null> => defaultDriverRepository.getPendingRequest('demo_driver')
};
