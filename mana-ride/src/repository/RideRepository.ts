import {
  VehicleType,
  VEHICLE_PRICING,
  RideRequest,
  RideStatus,
  RideHistoryItem,
  CustomerInfo,
  VehicleOption
} from '../types';
import { ApiClient, defaultApiClient } from '../api/apiClient';

export interface IRideRepository {
  getVehicles(): Promise<VehicleOption[]>;
  estimateFare(pickup: string, destination: string, vehicleType: VehicleType, distanceKm: number): Promise<{
    distanceKm: number;
    travelTimeMins: number;
    ratePerKm: number;
    baseFare: number;
    distanceFare: number;
    taxesAndFees: number;
    totalFare: number;
  }>;
  requestRide(requestData: Partial<RideRequest>): Promise<RideRequest>;
  cancelRide(rideId: string): Promise<boolean>;
  getCurrentRide(customerId: string): Promise<RideRequest | null>;
  getRideHistory(customerId: string): Promise<RideHistoryItem[]>;
  rateRide(rideId: string, rating: number, feedback?: string): Promise<boolean>;
  getCustomerProfile(customerId: string): Promise<CustomerInfo>;
}

const readNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const unwrapApiData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>) && (payload as any).data !== undefined) {
    return (payload as any).data as T;
  }
  return payload as T;
};

const normalizeRideStatus = (status?: string): RideStatus => {
  switch (status) {
    case 'SEARCHING_DRIVER':
      return RideStatus.SEARCHING;
    case 'DRIVER_ASSIGNED':
      return RideStatus.ACCEPTED;
    case 'DRIVER_ARRIVED':
      return RideStatus.ARRIVED_AT_PICKUP;
    case 'RIDE_STARTED':
      return RideStatus.IN_PROGRESS;
    case 'COMPLETED':
      return RideStatus.COMPLETED;
    case 'CANCELLED':
      return RideStatus.CANCELLED;
    default:
      return RideStatus.REQUESTED;
  }
};

const normalizeVehicleType = (raw: any): VehicleType => {
  const value = String(raw || '').toLowerCase();
  if (value === 'bike') return 'bike';
  if (value === 'scooty') return 'scooty';
  if (value === 'auto') return 'auto';
  return 'car';
};

const normalizeVehicleOption = (raw: any): VehicleOption => {
  const normalizedType = normalizeVehicleType(raw?.name || raw?.vehicleType || raw?.vehicle_type || 'car');
  const ratePerKm = readNumber(raw?.rate_per_km ?? raw?.ratePerKm ?? VEHICLE_PRICING[normalizedType].ratePerKm);
  return {
    id: normalizedType,
    name: raw?.name ?? VEHICLE_PRICING[normalizedType].name,
    category: raw?.category ?? raw?.name ?? VEHICLE_PRICING[normalizedType].name,
    ratePerKm,
    etaMins: readNumber(raw?.etaMins ?? raw?.eta_mins ?? VEHICLE_PRICING[normalizedType].eta),
    capacity: readNumber(raw?.capacity ?? 4),
    iconName: raw?.icon_name ?? raw?.iconName ?? VEHICLE_PRICING[normalizedType].icon,
    description: raw?.description ?? `${VEHICLE_PRICING[normalizedType].name} ride`
  };
};

export class RideRepository implements IRideRepository {
  private api: ApiClient;

  constructor(apiClient: ApiClient = defaultApiClient) {
    this.api = apiClient;
  }

  private getVehicleTypeId(vehicleType: VehicleType): number {
    const mapping: Record<VehicleType, number> = {
      bike: 1,
      scooty: 2,
      auto: 3,
      car: 4
    };
    return mapping[vehicleType] ?? 4;
  }

  async getVehicles(): Promise<VehicleOption[]> {
    const response = await this.api.get<any[]>('/vehicles/');
    const items = Array.isArray(response) ? response : Array.isArray((response as any)?.results) ? (response as any).results : [];
    return items.map(normalizeVehicleOption);
  }

  async estimateFare(
    pickup: string,
    destination: string,
    vehicleType: VehicleType,
    distanceKm: number = 12
  ) {
    try {
      const response = await this.api.post('/rides/estimate/', {
        vehicleTypeId: this.getVehicleTypeId(vehicleType),
        distanceKm,
        pickupAddress: pickup,
        destinationAddress: destination
      });

      const payload = unwrapApiData<any>(response);
      return {
        distanceKm: readNumber(payload.distanceKm ?? payload.distance_km ?? distanceKm),
        travelTimeMins: readNumber(payload.travelTimeMins ?? payload.travel_time_mins ?? Math.round(distanceKm * 1.68)),
        ratePerKm: readNumber(payload.ratePerKm ?? payload.rate_per_km ?? VEHICLE_PRICING[vehicleType].ratePerKm),
        baseFare: readNumber(payload.baseFare ?? payload.base_fare ?? 0),
        distanceFare: readNumber(payload.distanceFare ?? payload.distance_fare ?? distanceKm * VEHICLE_PRICING[vehicleType].ratePerKm),
        taxesAndFees: readNumber(payload.taxesAndFees ?? payload.taxes_and_fees ?? 0),
        totalFare: readNumber(payload.totalFare ?? payload.total_fare ?? payload.estimatedFare ?? payload.estimated_fare ?? distanceKm * VEHICLE_PRICING[vehicleType].ratePerKm)
      };
    } catch (error) {
      console.error('Error estimating fare:', error);
      const pricing = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.car;
      const distanceFare = distanceKm * pricing.ratePerKm;
      return {
        distanceKm,
        travelTimeMins: Math.round(distanceKm * 1.68),
        ratePerKm: pricing.ratePerKm,
        baseFare: 0,
        distanceFare,
        taxesAndFees: 0,
        totalFare: distanceFare
      };
    }
  }

  async requestRide(requestData: Partial<RideRequest>): Promise<RideRequest> {
    const vehicleType = requestData.vehicleType || 'car';
    const payload = {
      customerId: requestData.customerId || 'demo_customer',
      vehicleTypeId: this.getVehicleTypeId(vehicleType),
      pickupAddress: requestData.pickupAddress,
      pickupLat: requestData.pickupCoords?.lat,
      pickupLng: requestData.pickupCoords?.lng,
      destinationAddress: requestData.destinationAddress,
      destinationLat: requestData.destinationCoords?.lat,
      destinationLng: requestData.destinationCoords?.lng,
      distanceKm: requestData.distanceKm,
      estimatedFare: requestData.totalFare
    };

    const response = await this.api.post('/rides/request/', payload);
    const ride = unwrapApiData<any>(response);

    return {
      id: String(ride.id ?? 'ride-new'),
      customerId: String(ride.customerId ?? ride.customer_id ?? requestData.customerId ?? 'demo_customer'),
      customerName: ride.customerName ?? ride.customer_name ?? requestData.customerName ?? 'Demo Customer',
      customerPhone: ride.customerPhone ?? ride.customer_phone ?? requestData.customerPhone ?? '+91 99900 00001',
      customerRating: readNumber(ride.customerRating ?? ride.customer_rating ?? 5),
      customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      pickupAddress: ride.pickupAddress ?? ride.pickup_address ?? requestData.pickupAddress ?? '',
      pickupCoords: {
        lat: readNumber(ride.pickupLat ?? ride.pickup_lat ?? requestData.pickupCoords?.lat ?? 12.9716),
        lng: readNumber(ride.pickupLng ?? ride.pickup_lng ?? requestData.pickupCoords?.lng ?? 77.5946)
      },
      destinationAddress: ride.destinationAddress ?? ride.destination_address ?? requestData.destinationAddress ?? '',
      destinationCoords: {
        lat: readNumber(ride.destinationLat ?? ride.destination_lat ?? requestData.destinationCoords?.lat ?? 13.0068),
        lng: readNumber(ride.destinationLng ?? ride.destination_lng ?? requestData.destinationCoords?.lng ?? 77.5545)
      },
      distanceKm: readNumber(ride.distanceKm ?? ride.distance_km ?? requestData.distanceKm ?? 0),
      travelTimeMins: readNumber(ride.travelTimeMins ?? ride.travel_time_mins ?? Math.round((ride.distanceKm ?? ride.distance_km ?? requestData.distanceKm ?? 0) * 1.68)),
      vehicleType: normalizeVehicleType(ride.vehicleType?.name ?? ride.vehicle_type?.name ?? vehicleType),
      ratePerKm: readNumber(ride.vehicleType?.ratePerKm ?? ride.vehicle_type?.ratePerKm ?? ride.vehicle_type?.rate_per_km ?? VEHICLE_PRICING[vehicleType].ratePerKm),
      baseFare: 0,
      distanceFare: readNumber(ride.distanceFare ?? ride.distance_fare ?? ride.estimatedFare ?? ride.estimated_fare ?? requestData.totalFare ?? 0),
      taxesAndFees: 0,
      totalFare: readNumber(ride.estimatedFare ?? ride.estimated_fare ?? ride.totalFare ?? ride.total_fare ?? requestData.totalFare ?? 0),
      pin: String(ride.otp ?? ride.otp_code ?? requestData.pin ?? '1234'),
      status: normalizeRideStatus(ride.status),
      driver: ride.driver ? {
        id: String(ride.driver.id ?? '1'),
        name: ride.driver.name ?? 'Driver',
        rating: readNumber(ride.driver.rating ?? 4.8),
        totalRides: 0,
        vehicleModel: ride.driver.vehicleType?.name ?? ride.driver.vehicle_type?.name ?? 'Car',
        vehiclePlate: ride.driver.vehicleNumber ?? ride.driver.vehicle_number ?? 'NA',
        vehicleColor: 'White',
        vehicleType: normalizeVehicleType(ride.driver.vehicleType?.name ?? ride.driver.vehicle_type?.name ?? vehicleType),
        phone: ride.driver.phone ?? '+91 98765 43210',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        currentCoords: {
          lat: readNumber(ride.driver.currentLat ?? ride.driver.current_lat ?? 12.9352),
          lng: readNumber(ride.driver.currentLng ?? ride.driver.current_lng ?? 77.6245)
        }
      } : undefined,
      createdAt: ride.createdAt ?? ride.created_at ?? new Date().toISOString()
    };
  }

  async cancelRide(rideId: string): Promise<boolean> {
    try {
      await this.api.post(`/rides/${rideId}/cancel/`, {});
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentRide(customerId: string): Promise<RideRequest | null> {
    try {
      const response = await this.api.get(`/rides/current/?customerId=${customerId}`);
      const ride = unwrapApiData<any>(response);
      if (!ride || !ride.id) return null;

      return {
        id: String(ride.id),
        customerId: String(ride.customerId ?? ride.customer_id ?? customerId),
        customerName: ride.customerName ?? ride.customer_name ?? 'Demo Customer',
        customerPhone: ride.customerPhone ?? ride.customer_phone ?? '+91 99900 00001',
        customerRating: readNumber(ride.customerRating ?? ride.customer_rating ?? 5),
        customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        pickupAddress: ride.pickupAddress ?? ride.pickup_address ?? '',
        pickupCoords: {
          lat: readNumber(ride.pickupLat ?? ride.pickup_lat ?? 12.9716),
          lng: readNumber(ride.pickupLng ?? ride.pickup_lng ?? 77.5946)
        },
        destinationAddress: ride.destinationAddress ?? ride.destination_address ?? '',
        destinationCoords: {
          lat: readNumber(ride.destinationLat ?? ride.destination_lat ?? 13.0068),
          lng: readNumber(ride.destinationLng ?? ride.destination_lng ?? 77.5545)
        },
        distanceKm: readNumber(ride.distanceKm ?? ride.distance_km ?? 0),
        travelTimeMins: readNumber(ride.travelTimeMins ?? ride.travel_time_mins ?? 30),
        vehicleType: normalizeVehicleType(ride.vehicleType?.name ?? ride.vehicle_type?.name ?? 'car'),
        ratePerKm: readNumber(ride.vehicleType?.ratePerKm ?? ride.vehicle_type?.ratePerKm ?? ride.vehicle_type?.rate_per_km ?? 25),
        baseFare: 0,
        distanceFare: readNumber(ride.distanceFare ?? ride.distance_fare ?? 0),
        taxesAndFees: 0,
        totalFare: readNumber(ride.totalFare ?? ride.total_fare ?? ride.estimatedFare ?? ride.estimated_fare ?? 0),
        pin: String(ride.otp ?? ride.otp_code ?? '1234'),
        status: normalizeRideStatus(ride.status),
        createdAt: ride.createdAt ?? ride.created_at ?? new Date().toISOString(),
        driver: ride.driver ? {
          id: String(ride.driver.id ?? '1'),
          name: ride.driver.name ?? 'Driver',
          rating: readNumber(ride.driver.rating ?? 4.8),
          totalRides: 0,
          vehicleModel: ride.driver.vehicleType?.name ?? ride.driver.vehicle_type?.name ?? 'Car',
          vehiclePlate: ride.driver.vehicleNumber ?? ride.driver.vehicle_number ?? 'NA',
          vehicleColor: 'White',
          vehicleType: normalizeVehicleType(ride.driver.vehicleType?.name ?? ride.driver.vehicle_type?.name ?? 'car'),
          phone: ride.driver.phone ?? '+91 98765 43210',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          currentCoords: {
            lat: readNumber(ride.driver.currentLat ?? ride.driver.current_lat ?? 12.9352),
            lng: readNumber(ride.driver.currentLng ?? ride.driver.current_lng ?? 77.6245)
          }
        } : undefined
      };
    } catch {
      return null;
    }
  }

  async getRideHistory(customerId: string): Promise<RideHistoryItem[]> {
    try {
      const response = await this.api.get(`/rides/history/?customerId=${customerId}`);
      const items = Array.isArray(response) ? response : Array.isArray((response as any)?.results) ? (response as any).results : [];
      return items.map((ride: any) => ({
        id: String(ride.id ?? ''),
        date: new Date(ride.createdAt ?? ride.created_at ?? Date.now()).toLocaleDateString(),
        time: new Date(ride.createdAt ?? ride.created_at ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicleName: ride.vehicleType?.name ?? ride.vehicle_type?.name ?? 'Vehicle',
        vehicleCategory: ride.vehicleType?.name ?? ride.vehicle_type?.name ?? 'Vehicle',
        pickupAddress: ride.pickupAddress ?? ride.pickup_address ?? 'Pickup',
        pickupSubtext: 'Pickup Point',
        dropoffAddress: ride.destinationAddress ?? ride.destination_address ?? 'Destination',
        dropoffSubtext: 'Destination',
        driverName: ride.driver?.name ?? 'N/A',
        driverRating: readNumber(ride.driver?.rating ?? 4.5),
        driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        amount: readNumber(ride.finalFare ?? ride.final_fare ?? ride.estimatedFare ?? ride.estimated_fare ?? 0),
        status: ride.status === 'COMPLETED' ? 'Completed' : ride.status === 'CANCELLED' ? 'Cancelled' : 'Completed',
        distanceKm: readNumber(ride.distanceKm ?? ride.distance_km ?? 0),
        durationMins: readNumber(ride.travelTimeMins ?? ride.travel_time_mins ?? 30)
      }));
    } catch {
      return [];
    }
  }

  async rateRide(rideId: string, rating: number, feedback?: string): Promise<boolean> {
    try {
      await this.api.post(`/rides/${rideId}/rate/`, {
        customerRating: rating,
        customer_rating: rating,
        customerFeedback: feedback || '',
        customer_feedback: feedback || ''
      });
      return true;
    } catch {
      return false;
    }
  }

  async getCustomerProfile(customerId: string): Promise<CustomerInfo> {
    return {
      id: String(customerId),
      name: 'Demo Customer',
      phone: '+91 99900 00001',
      email: 'demo.customer@example.com',
      rating: 5,
      totalRides: 0,
      membershipYears: 1,
      memberTier: 'Demo Member',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
  }
}

export const defaultRideRepository = new RideRepository();

export const rideRepository = {
  getCustomerProfile: async (): Promise<CustomerInfo> => defaultRideRepository.getCustomerProfile('demo_customer'),
  getHistory: async (): Promise<RideHistoryItem[]> => defaultRideRepository.getRideHistory('demo_customer'),
  getVehicles: async (): Promise<VehicleOption[]> => defaultRideRepository.getVehicles(),
  estimateFare: async (
    pickup: string,
    destination: string,
    vehicleType: VehicleType,
    distanceKm: number = 12
  ) => defaultRideRepository.estimateFare(pickup, destination, vehicleType, distanceKm),
  requestRide: async (pickupAddress: string, destinationAddress: string, vehicleType: VehicleType): Promise<RideRequest> => defaultRideRepository.requestRide({
    customerId: 'demo_customer',
    customerName: 'Demo Customer',
    customerPhone: '+91 99900 00001',
    pickupAddress,
    destinationAddress,
    pickupCoords: { lat: 12.9716, lng: 77.5946 },
    destinationCoords: { lat: 13.0068, lng: 77.5545 },
    distanceKm: 12,
    vehicleType,
    totalFare: 12 * VEHICLE_PRICING[vehicleType].ratePerKm,
    pin: '1234',
    status: RideStatus.SEARCHING,
    createdAt: new Date().toISOString()
  }),
  rateRide: (rideId: string, rating: number, feedback?: string): Promise<boolean> => defaultRideRepository.rateRide(rideId, rating, feedback),
  getCurrentRide: async (): Promise<RideRequest | null> => defaultRideRepository.getCurrentRide('demo_customer')
};
