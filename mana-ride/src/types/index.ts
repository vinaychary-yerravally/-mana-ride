export type VehicleType = 'bike' | 'scooty' | 'auto' | 'car';

export interface VehicleOption {
  id: VehicleType;
  name: string;
  category: string;
  ratePerKm: number;
  etaMins: number;
  capacity: number;
  iconName: string;
  description: string;
}

export const VEHICLE_PRICING: Record<VehicleType, { ratePerKm: number; name: string; eta: number; capacity: number; icon: string }> = {
  bike: {
    ratePerKm: 10,
    name: 'Bike',
    eta: 2,
    capacity: 1,
    icon: 'two_wheeler'
  },
  scooty: {
    ratePerKm: 10,
    name: 'Scooty',
    eta: 3,
    capacity: 1,
    icon: 'moped'
  },
  auto: {
    ratePerKm: 15,
    name: 'Auto',
    eta: 5,
    capacity: 3,
    icon: 'electric_rickshaw'
  },
  car: {
    ratePerKm: 25,
    name: 'Car',
    eta: 4,
    capacity: 4,
    icon: 'directions_car'
  }
};

export enum RideStatus {
  IDLE = 'IDLE',
  REQUESTED = 'REQUESTED',
  SELECTING_VEHICLE = 'SELECTING_VEHICLE',
  FARE_DETAILS = 'FARE_DETAILS',
  SEARCHING = 'SEARCHING',
  ACCEPTED = 'ACCEPTED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  GOING_TO_PICKUP = 'GOING_TO_PICKUP',
  ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPreset {
  label: string;
  address: string;
  coords: Coordinates;
}

export interface DriverInfo {
  id: string;
  name: string;
  rating: number;
  totalRides: number;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleType: VehicleType;
  phone: string;
  avatarUrl: string;
  currentCoords: Coordinates;
}

export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalRides: number;
  membershipYears: number;
  memberTier: string;
  avatarUrl: string;
}

export type CustomerProfile = CustomerInfo;

export interface RideRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  customerAvatar?: string;
  pickupAddress: string;
  pickupCoords: Coordinates;
  destinationAddress: string;
  destinationCoords: Coordinates;
  distanceKm: number;
  travelTimeMins: number;
  vehicleType: VehicleType;
  ratePerKm: number;
  baseFare: number; // 0.00
  distanceFare: number;
  taxesAndFees: number;
  totalFare: number;
  pin: string;
  status: RideStatus;
  driver?: DriverInfo;
  createdAt: string;
}

export interface DriverStats {
  isOnline: boolean;
  todayEarnings: number;
  yesterdayChangePct: number;
  weeklyEarnings: number;
  totalRidesCount: number;
  hoursOnline: number;
  weeklyTrend: { day: string; amount: number; isHighlight?: boolean }[];
  recentRides: {
    id: string;
    title: string;
    subtext: string;
    distance: string;
    amount: number;
    status: 'Completed' | 'Cancelled';
  }[];
}

export interface RideHistoryItem {
  id: string;
  date: string;
  time: string;
  vehicleName: string;
  vehicleCategory: string;
  pickupAddress: string;
  pickupSubtext: string;
  dropoffAddress: string;
  dropoffSubtext: string;
  driverName?: string | null;
  driverRating?: number | null;
  driverAvatar?: string | null;
  amount: number;
  status: 'Completed' | 'Cancelled';
  distanceKm: number;
  durationMins: number;
}
