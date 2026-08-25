import React, { useEffect, useMemo, useState } from 'react';
import { VehicleType, RideStatus, RideRequest, DriverStats, CustomerInfo, RideHistoryItem, Coordinates } from './types';
import { rideRepository } from './repository/RideRepository';
import { driverRepository } from './repository/DriverRepository';

// Common Components
import { TopBar } from './components/common/TopBar';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { ArchitectureInspector } from './components/dev/ArchitectureInspector';

// Customer Components
import { SplashScreen } from './components/customer/SplashScreen';
import { CustomerLogin } from './components/customer/CustomerLogin';
import { CustomerHome } from './components/customer/CustomerHome';
import { VehicleSelection } from './components/customer/VehicleSelection';
import { FareDetails } from './components/customer/FareDetails';
import { SearchingDriver } from './components/customer/SearchingDriver';
import { DriverAssigned } from './components/customer/DriverAssigned';
import { RideInProgress } from './components/customer/RideInProgress';
import { RideCompleted } from './components/customer/RideCompleted';
import { RideHistory } from './components/customer/RideHistory';
import { CustomerProfile } from './components/customer/CustomerProfile';

// Driver Components
import { DriverDashboard } from './components/driver/DriverDashboard';
import { RideRequestModal } from './components/driver/RideRequestModal';
import { GoToPickup } from './components/driver/GoToPickup';
import { DriverEarnings } from './components/driver/DriverEarnings';

export type ScreenId =
  | 'SPLASH'
  | 'LOGIN'
  | 'HOME'
  | 'VEHICLE_SELECT'
  | 'FARE_DETAILS'
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'HISTORY'
  | 'PROFILE'
  | 'DRIVER_DASHBOARD'
  | 'RIDE_REQUEST'
  | 'GO_TO_PICKUP'
  | 'DRIVER_EARNINGS';

const defaultCustomerProfile: CustomerInfo = {
  id: 'demo_customer',
  name: 'Demo Customer',
  phone: '+91 99900 00001',
  email: 'demo.customer@example.com',
  rating: 5,
  totalRides: 0,
  membershipYears: 1,
  memberTier: 'Demo Member',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

const emptyDriverStats: DriverStats = {
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

export default function App() {
  // Navigation & Role State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('HOME');
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');
  const [userRole, setUserRole] = useState<'customer' | 'driver'>('customer');
  const [showInspector, setShowInspector] = useState(false);

  // Customer State
  const defaultPickupCoords: Coordinates = { lat: 12.9352, lng: 77.6245 };
  const defaultDestinationCoords: Coordinates = { lat: 13.1986, lng: 77.7066 };

  const [pickupAddress, setPickupAddress] = useState('1st Block Koramangala');
  const [destinationAddress, setDestinationAddress] = useState("Kempegowda Int'l Airport");
  const [pickupCoords, setPickupCoords] = useState<Coordinates>(defaultPickupCoords);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates>(defaultDestinationCoords);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [fareEstimate, setFareEstimate] = useState<{
    distanceKm: number;
    travelTimeMins: number;
    ratePerKm: number;
    baseFare: number;
    distanceFare: number;
    taxesAndFees: number;
    totalFare: number;
  } | null>(null);
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerInfo>(defaultCustomerProfile);
  const [rideHistory, setRideHistory] = useState<RideHistoryItem[]>([]);

  // Driver State
  const [isDriverOnline, setIsDriverOnline] = useState(false);
  const [driverStats, setDriverStats] = useState<DriverStats>(emptyDriverStats);
  const [showDriverRequestModal, setShowDriverRequestModal] = useState(false);
  const [activeDriverRide, setActiveDriverRide] = useState<RideRequest | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      const [profile, history, stats] = await Promise.all([
        rideRepository.getCustomerProfile('demo_customer'),
        rideRepository.getRideHistory('demo_customer'),
        driverRepository.getDriverStats('demo_driver')
      ]);

      if (!cancelled) {
        setCustomerProfile(profile);
        setRideHistory(history);
        setDriverStats(stats);
      }
    };

    void loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Navigation Handlers
  const handleTabChange = (tab: NavTab) => {
    setActiveNavTab(tab);
    if (tab === 'home') setCurrentScreen('HOME');
    if (tab === 'rides') setCurrentScreen('HISTORY');
    if (tab === 'profile') setCurrentScreen('PROFILE');
    if (tab === 'payments') {
      alert('MANA Pay & UPI Wallets: Linked Bank Account Active');
    }
  };

  const handleLocationSelection = (field: 'pickup' | 'destination', value: string, coords?: Coordinates) => {
    const cleanValue = value.trim();
    const fallbackAddress = field === 'pickup' ? '1st Block Koramangala' : "Kempegowda Int'l Airport";
    const fallbackCoords = field === 'pickup'
      ? { lat: 12.9352, lng: 77.6245 }
      : { lat: 13.1986, lng: 77.7066 };

    const nextValue = cleanValue || fallbackAddress;

    if (field === 'pickup') {
      setPickupAddress(nextValue);
      setPickupCoords(coords || fallbackCoords);
    } else {
      setDestinationAddress(nextValue);
      setDestinationCoords(coords || fallbackCoords);
    }
  };

  const canBookRide = pickupAddress.trim().length > 0 && destinationAddress.trim().length > 0;

  const handleBookRideClick = () => {
    const cleanPickup = pickupAddress.trim();
    const cleanDestination = destinationAddress.trim();

    if (!cleanPickup || !cleanDestination) {
      alert('Please select both a pickup and destination before booking your ride.');
      return;
    }

    setCurrentScreen('VEHICLE_SELECT');
  };

  const handleConfirmVehicle = async () => {
    try {
      const estimate = await rideRepository.estimateFare(
        pickupAddress,
        destinationAddress,
        selectedVehicle,
        fareEstimate?.distanceKm ?? 12
      );

      setFareEstimate(estimate);
      setCurrentScreen('FARE_DETAILS');
    } catch (error: any) {
      alert(error?.message || 'Unable to estimate fare for this route.');
    }
  };

  const handleConfirmFare = async () => {
    try {
      const estimate = fareEstimate ?? await rideRepository.estimateFare(
        pickupAddress,
        destinationAddress,
        selectedVehicle,
        12
      );

      const ride = await rideRepository.requestRide({
        customerId: 'demo_customer',
        customerName: 'Demo Customer',
        customerPhone: '+91 99900 00001',
        pickupAddress,
        destinationAddress,
        pickupCoords,
        destinationCoords,
        distanceKm: estimate.distanceKm,
        vehicleType: selectedVehicle,
        totalFare: estimate.totalFare,
        pin: '1234',
        status: RideStatus.SEARCHING,
        createdAt: new Date().toISOString()
      });
      setCurrentRide(ride);
      setCurrentScreen('SEARCHING');
    } catch (error: any) {
      alert(error?.message || 'Ride request failed. Please try again.');
    }
  };

  const handleDriverFound = () => {
    if (currentRide) {
      currentRide.status = RideStatus.ACCEPTED;
    }
    setCurrentScreen('DRIVER_ASSIGNED');
  };

  const handleStartCustomerRide = () => {
    if (currentRide) {
      currentRide.status = RideStatus.IN_PROGRESS;
    }
    setCurrentScreen('IN_PROGRESS');
  };

  const handleCompleteRide = () => {
    if (currentRide) {
      currentRide.status = RideStatus.COMPLETED;
    }
    setCurrentScreen('COMPLETED');
  };

  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (currentRide) {
      await rideRepository.rateRide(currentRide.id, rating, feedback);
    }
    setCurrentScreen('HOME');
    setActiveNavTab('home');
  };

  // Driver Handlers
  const handleToggleDriverOnline = async () => {
    const newStatus = !isDriverOnline;
    setIsDriverOnline(newStatus);
    await driverRepository.setOnline(newStatus);
    const stats = await driverRepository.getDriverStats('demo_driver');
    setDriverStats(stats);
    if (newStatus) {
      setTimeout(() => {
        setShowDriverRequestModal(true);
      }, 1500);
    } else {
      setShowDriverRequestModal(false);
    }
  };

  const handleAcceptDriverRide = async (rideId: string) => {
    const accepted = await driverRepository.acceptRide(rideId, 'demo_driver');
    setShowDriverRequestModal(false);
    setActiveDriverRide(accepted);
    if (accepted) {
      setCurrentScreen('GO_TO_PICKUP');
    }
  };

  const handleDeclineDriverRide = () => {
    setShowDriverRequestModal(false);
  };

  const handleDriverStartTrip = async (pin: string) => {
    if (activeDriverRide) {
      const inProgress = await driverRepository.startRide(activeDriverRide.id, pin);
      setActiveDriverRide(inProgress);
      setCurrentScreen('IN_PROGRESS');
    }
  };

  // Determine TopBar Configuration
  const isDriverScreen = [
    'DRIVER_DASHBOARD',
    'RIDE_REQUEST',
    'GO_TO_PICKUP',
    'DRIVER_EARNINGS'
  ].includes(currentScreen);

  const isDarkScreen = isDriverScreen;

  const showTopBar = !['SPLASH', 'LOGIN'].includes(currentScreen);
  const showBottomNav =
    !isDriverScreen &&
    !['SPLASH', 'LOGIN', 'SEARCHING', 'DRIVER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VEHICLE_SELECT', 'FARE_DETAILS'].includes(
      currentScreen
    );

  const getTopBarTitle = () => {
    if (currentScreen === 'FARE_DETAILS') return 'Fare Details';
    if (currentScreen === 'VEHICLE_SELECT') return 'Select Vehicle';
    if (currentScreen === 'HISTORY') return 'Ride History';
    if (currentScreen === 'PROFILE') return 'My Profile';
    if (currentScreen === 'DRIVER_EARNINGS') return 'Driver Earnings';
    return 'MANA RIDE';
  };

  const showBackButton = [
    'VEHICLE_SELECT',
    'FARE_DETAILS',
    'HISTORY',
    'PROFILE',
    'DRIVER_EARNINGS'
  ].includes(currentScreen);

  const handleBack = () => {
    if (currentScreen === 'VEHICLE_SELECT') setCurrentScreen('HOME');
    else if (currentScreen === 'FARE_DETAILS') setCurrentScreen('VEHICLE_SELECT');
    else if (currentScreen === 'HISTORY' || currentScreen === 'PROFILE') {
      setCurrentScreen('HOME');
      setActiveNavTab('home');
    } else if (currentScreen === 'DRIVER_EARNINGS') {
      setCurrentScreen('DRIVER_DASHBOARD');
    } else {
      setCurrentScreen('HOME');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#E5E7EB] text-slate-900 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 font-sans select-none" style={{ backgroundColor: '#E5E7EB' }}>
      {/* Top Application Control & Switcher Bar */}
      <header className="w-full max-w-5xl bg-white text-slate-800 rounded-2xl p-3.5 sm:p-4 mb-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold shadow-sm">
            <span className="material-symbols-outlined text-2xl fill-1">directions_car</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mobile App Platform</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                Kotlin Jetpack Compose
              </span>
            </div>
            <h1 className="font-extrabold text-lg tracking-tight text-indigo-950 flex items-center gap-2">
              MANA RIDE
            </h1>
          </div>
        </div>

        {/* Role Switcher & Inspector Toggle */}
        <div className="flex items-center gap-2">
          {/* Customer / Driver Role Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => {
                setUserRole('customer');
                setCurrentScreen('HOME');
                setActiveNavTab('home');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'customer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">person</span>
              <span>Customer</span>
            </button>

            <button
              onClick={() => {
                setUserRole('driver');
                setCurrentScreen('DRIVER_DASHBOARD');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'driver'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">drive_eta</span>
              <span>Driver</span>
            </button>
          </div>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showInspector
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Inspect Android Kotlin & Django Code"
          >
            <span className="material-symbols-outlined text-base">code</span>
            <span className="hidden sm:inline">Inspect Code</span>
          </button>
        </div>
      </header>

      {/* Main Container: Mobile Frame Mockup & Content */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Android Device Mockup (Pixel 8 / Galaxy S24 Clean Minimalism) */}
        <div className="relative w-full max-w-[360px] sm:max-w-[390px] h-[720px] sm:h-[780px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-[#1F2937] flex flex-col relative overflow-hidden flex-shrink-0">
          {/* Top Notch Bar */}
          <div className="h-6 w-32 bg-[#1F2937] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ml-2" />
          </div>

          {/* Android Status Bar */}
          <div
            className={`w-full h-8 px-6 pt-1 flex items-center justify-between text-xs font-bold z-40 select-none ${
              isDarkScreen ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-800'
            }`}
          >
            <span className="text-[11px]">9:41</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[14px]">wifi</span>
              <span className="material-symbols-outlined text-[16px]">battery_full</span>
            </div>
          </div>

          {/* App Screen Container */}
          <div className={`flex-1 w-full flex flex-col overflow-hidden relative ${isDarkScreen ? 'bg-[#0F172A]' : 'bg-white'}`}>
            {/* Top Bar */}
            {showTopBar && (
              <TopBar
                title={getTopBarTitle()}
                showBack={showBackButton}
                onBack={handleBack}
                onProfileClick={() => {
                  if (userRole === 'customer') {
                    setCurrentScreen('PROFILE');
                    setActiveNavTab('profile');
                  }
                }}
                dark={isDarkScreen}
              />
            )}

            {/* Screen Viewport Switcher */}
            <div className="flex-1 w-full overflow-hidden relative">
              {/* 1. Splash */}
              {currentScreen === 'SPLASH' && (
                <SplashScreen onFinish={() => setCurrentScreen('LOGIN')} />
              )}

              {/* 2. Login */}
              {currentScreen === 'LOGIN' && (
                <CustomerLogin
                  onLoginSuccess={() => {
                    setCurrentScreen('HOME');
                    setActiveNavTab('home');
                  }}
                />
              )}

              {/* 3. Home */}
              {currentScreen === 'HOME' && (
                <CustomerHome
                  userName="Vinay"
                  pickupAddress={pickupAddress}
                  destinationAddress={destinationAddress}
                  canProceed={canBookRide}
                  onSelectPickup={(address, coords) => handleLocationSelection('pickup', address, coords)}
                  onSelectDestination={(address, coords) => handleLocationSelection('destination', address, coords)}
                  onBookRideClick={handleBookRideClick}
                />
              )}

              {/* 4. Vehicle Selection */}
              {currentScreen === 'VEHICLE_SELECT' && (
                <VehicleSelection
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                  onConfirm={handleConfirmVehicle}
                  onBack={handleBack}
                />
              )}

              {/* 5. Fare Details */}
              {currentScreen === 'FARE_DETAILS' && (
                <FareDetails
                  pickupAddress={pickupAddress}
                  destinationAddress={destinationAddress}
                  vehicleType={selectedVehicle}
                  fareEstimate={fareEstimate}
                  onConfirmRide={handleConfirmFare}
                  onBack={handleBack}
                />
              )}

              {/* 6. Searching Driver */}
              {currentScreen === 'SEARCHING' && (
                <SearchingDriver
                  vehicleType={selectedVehicle}
                  pickupAddress={pickupAddress}
                  destinationAddress={destinationAddress}
                  totalFare={currentRide?.totalFare || 1010.62}
                  onDriverFound={handleDriverFound}
                  onCancel={() => setCurrentScreen('HOME')}
                />
              )}

              {/* 7. Driver Assigned */}
              {currentScreen === 'DRIVER_ASSIGNED' && (
                <DriverAssigned
                  driver={
                    currentRide?.driver || {
                      id: 'drv-101',
                      name: 'Rajesh K.',
                      rating: 4.9,
                      totalRides: 4281,
                      vehicleModel: 'Swift Dzire',
                      vehiclePlate: 'MH 12 AB 1234',
                      vehicleColor: 'White',
                      vehicleType: selectedVehicle,
                      phone: '+91 98765 43210',
                      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                      currentCoords: { lat: 12.9352, lng: 77.6245 }
                    }
                  }
                  pin={currentRide?.pin || '8291'}
                  onStartRide={handleStartCustomerRide}
                  onCancelRide={() => setCurrentScreen('HOME')}
                />
              )}

              {/* 8. Ride in Progress */}
              {currentScreen === 'IN_PROGRESS' && (
                <RideInProgress
                  driver={
                    currentRide?.driver || {
                      id: 'drv-101',
                      name: 'Rajesh K.',
                      rating: 4.9,
                      totalRides: 4281,
                      vehicleModel: 'Swift Dzire',
                      vehiclePlate: 'MH 12 AB 1234',
                      vehicleColor: 'White',
                      vehicleType: selectedVehicle,
                      phone: '+91 98765 43210',
                      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                      currentCoords: { lat: 12.9352, lng: 77.6245 }
                    }
                  }
                  totalFare={currentRide?.totalFare || 1010.62}
                  onCompleteRide={handleCompleteRide}
                />
              )}

              {/* 9. Ride Completed */}
              {currentScreen === 'COMPLETED' && (
                <RideCompleted
                  totalFare={currentRide?.totalFare || 1010.62}
                  distanceKm={38.5}
                  durationMins={65}
                  driverName={currentRide?.driver?.name || 'Rajesh Kumar'}
                  vehicleDetails="Swift Dzire • MH 12 AB 1234"
                  onSubmitRating={handleSubmitRating}
                  onDone={() => {
                    setCurrentScreen('HOME');
                    setActiveNavTab('home');
                  }}
                />
              )}

              {/* 10. Ride History */}
              {currentScreen === 'HISTORY' && (
                <RideHistory history={rideHistory} />
              )}

              {/* 11. Customer Profile */}
              {currentScreen === 'PROFILE' && (
                <CustomerProfile
                  profile={customerProfile}
                  onLogout={() => setCurrentScreen('LOGIN')}
                  onSwitchToDriver={() => {
                    setUserRole('driver');
                    setCurrentScreen('DRIVER_DASHBOARD');
                  }}
                />
              )}

              {/* 12. Driver Dashboard */}
              {currentScreen === 'DRIVER_DASHBOARD' && (
                <DriverDashboard
                  isOnline={isDriverOnline}
                  stats={driverStats}
                  onToggleOnline={handleToggleDriverOnline}
                  onSimulateIncomingRequest={() => setShowDriverRequestModal(true)}
                  onViewEarnings={() => setCurrentScreen('DRIVER_EARNINGS')}
                  onSwitchToCustomer={() => {
                    setUserRole('customer');
                    setCurrentScreen('HOME');
                    setActiveNavTab('home');
                  }}
                />
              )}

              {/* 14. Go to Pickup (Driver) */}
              {currentScreen === 'GO_TO_PICKUP' && activeDriverRide && (
                <GoToPickup
                  ride={activeDriverRide}
                  onArrived={() => {}}
                  onStartRide={handleDriverStartTrip}
                  onCancel={() => setCurrentScreen('DRIVER_DASHBOARD')}
                />
              )}

              {/* 15. Driver Earnings */}
              {currentScreen === 'DRIVER_EARNINGS' && (
                <DriverEarnings
                  stats={driverStats}
                  onBack={() => setCurrentScreen('DRIVER_DASHBOARD')}
                />
              )}

              {/* Modal 13: Ride Request Modal Overlay */}
              {showDriverRequestModal && (
                <RideRequestModal
                  request={{
                    id: 'REQ-991',
                    customerId: 'cust-101',
                    customerName: 'Rahul S.',
                    customerPhone: '+91 98123 45678',
                    customerRating: 4.8,
                    pickupAddress: 'Bandra West Station, Station Road',
                    pickupCoords: { lat: 19.0544, lng: 72.8402 },
                    destinationAddress: 'Phoenix Palladium Mall, Lower Parel',
                    destinationCoords: { lat: 18.9953, lng: 72.8242 },
                    distanceKm: 12.0,
                    travelTimeMins: 35,
                    vehicleType: 'car',
                    ratePerKm: 25.0,
                    baseFare: 0.0,
                    distanceFare: 240.0,
                    taxesAndFees: 0.0,
                    totalFare: 240.0,
                    pin: '8291',
                    status: RideStatus.REQUESTED,
                    createdAt: new Date().toISOString()
                  }}
                  onAccept={handleAcceptDriverRide}
                  onDecline={handleDeclineDriverRide}
                />
              )}
            </div>

            {/* Bottom Navigation */}
            {showBottomNav && (
              <BottomNav
                activeTab={activeNavTab}
                onTabChange={handleTabChange}
                dark={isDarkScreen}
              />
            )}
          </div>

          {/* Android Gesture Bar */}
          <div className="w-full h-4 bg-black flex items-center justify-center z-50">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Side Panel: Screen Info & Architecture Highlights */}
        <aside className="w-full max-w-md flex flex-col gap-4">
          {/* Active Screen Info Card */}
          <div className="bg-white text-slate-800 p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live Screen Context
              </span>
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {userRole.toUpperCase()} MODE
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">
              {currentScreen.replace(/_/g, ' ')}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {currentScreen === 'HOME' &&
                'Customer entry point with dynamic map, quick destination chips, and instant route selection.'}
              {currentScreen === 'VEHICLE_SELECT' &&
                'Transparent vehicle tier list (Bike, Scooty, Auto, Car) with strict NO BASE FARE guarantee.'}
              {currentScreen === 'FARE_DETAILS' &&
                'Itemized fare calculation showing distance × rate formula and base fare strikethrough.'}
              {currentScreen === 'SEARCHING' &&
                'Real-time animated radar simulation dispatching nearby drivers using asynchronous coroutines.'}
              {currentScreen === 'DRIVER_ASSIGNED' &&
                'Assigned driver info, 4-digit security PIN verification, vehicle plate details, and communication actions.'}
              {currentScreen === 'IN_PROGRESS' &&
                'Live GPS route tracking, dynamic ETA countdown, fare tracking, and emergency SOS shield.'}
              {currentScreen === 'COMPLETED' &&
                'Trip summary, receipt, confetti celebration, and interactive 5-star rating submission.'}
              {currentScreen === 'HISTORY' &&
                'Categorized trip history with status filtering (All, Completed, Cancelled) and receipt downloads.'}
              {currentScreen === 'PROFILE' &&
                'Customer profile details, gold tier status, saved locations, and emergency contacts.'}
              {currentScreen === 'DRIVER_DASHBOARD' &&
                'Driver duty toggle with emerald/indigo status glow, today earnings, completed trips, and online hours.'}
              {currentScreen === 'GO_TO_PICKUP' &&
                'Driver navigation to passenger pickup location, contact triggers, and PIN verification input.'}
              {currentScreen === 'DRIVER_EARNINGS' &&
                'Daily and weekly earnings trend chart, recent ride breakdowns, and direct bank payout.'}
            </p>

            {/* Zero Base Fare Rules Callout */}
            <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-100 flex flex-col gap-1.5 text-xs">
              <span className="font-bold text-indigo-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-indigo-600 fill-1">verified</span>
                MANA RIDE Transparent Pricing Formula
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 mt-1 font-medium">
                <div>• Bike: ₹10/km</div>
                <div>• Scooty: ₹10/km</div>
                <div>• Auto: ₹15/km</div>
                <div>• Car: ₹25/km</div>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                ✓ There is NO base fare. Distance Fare = Distance (km) × Rate/km
              </div>
            </div>
          </div>

          {/* Architecture Summary */}
          <div className="bg-white text-slate-700 p-5 rounded-3xl border border-slate-200 shadow-sm text-xs flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 text-sm">Android & Backend Architecture</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-base mt-0.5">check_circle</span>
                <div>
                  <span className="font-bold text-slate-900">Single Activity + Compose NavHost:</span> Clean navigation graph routing across all customer and driver flows.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-base mt-0.5">check_circle</span>
                <div>
                  <span className="font-bold text-slate-900">Repository Pattern:</span> Separation of concerns in <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">RideRepository</code> and <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">DriverRepository</code>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-base mt-0.5">check_circle</span>
                <div>
                  <span className="font-bold text-slate-900">Django REST Backend Ready:</span> Models, serializers, and pricing views in <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">src/android_code/django_backend/</code>.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Code Inspector Drawer */}
      {showInspector && (
        <section className="w-full max-w-5xl mt-6">
          <ArchitectureInspector
            currentScreenName={currentScreen}
            onJumpToScreen={(screenId) => {
              setCurrentScreen(screenId as ScreenId);
              if (['DRIVER_DASHBOARD', 'RIDE_REQUEST', 'GO_TO_PICKUP', 'DRIVER_EARNINGS'].includes(screenId)) {
                setUserRole('driver');
              } else {
                setUserRole('customer');
              }
            }}
          />
        </section>
      )}
    </div>
  );
}
