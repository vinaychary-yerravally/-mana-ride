import React, { useState } from 'react';

interface ArchitectureInspectorProps {
  currentScreenName: string;
  onJumpToScreen: (screenId: string) => void;
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({
  currentScreenName,
  onJumpToScreen
}) => {
  const [activeTab, setActiveTab] = useState<'KOTLIN' | 'DJANGO' | 'NAV_GRAPH' | 'PRICING'>('KOTLIN');
  const [copied, setCopied] = useState(false);

  const screensList = [
    { id: 'SPLASH', label: '1. Splash Screen', category: 'Customer' },
    { id: 'LOGIN', label: '2. Customer Login', category: 'Customer' },
    { id: 'HOME', label: '3. Customer Home', category: 'Customer' },
    { id: 'VEHICLE_SELECT', label: '4. Vehicle Selection', category: 'Customer' },
    { id: 'FARE_DETAILS', label: '5. Fare Details', category: 'Customer' },
    { id: 'SEARCHING', label: '6. Searching Driver', category: 'Customer' },
    { id: 'DRIVER_ASSIGNED', label: '7. Driver Assigned', category: 'Customer' },
    { id: 'IN_PROGRESS', label: '8. Ride In Progress', category: 'Customer' },
    { id: 'COMPLETED', label: '9. Ride Completed', category: 'Customer' },
    { id: 'HISTORY', label: '10. Ride History', category: 'Customer' },
    { id: 'PROFILE', label: '11. Customer Profile', category: 'Customer' },
    { id: 'DRIVER_DASHBOARD', label: '12. Driver Dashboard', category: 'Driver' },
    { id: 'RIDE_REQUEST', label: '13. Driver Ride Request', category: 'Driver' },
    { id: 'GO_TO_PICKUP', label: '14. Go to Pickup', category: 'Driver' },
    { id: 'DRIVER_EARNINGS', label: '15. Driver Earnings', category: 'Driver' }
  ];

  const kotlinCode = `// Architecture: UI (Compose) -> ViewModel (StateFlow) -> Repository -> Retrofit Service -> Django REST API
package com.manaride.app

class CustomerViewModel(
    private val repository: RideRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(CustomerUiState())
    val uiState: StateFlow<CustomerUiState> = _uiState.asStateFlow()

    fun selectVehicle(vehicleType: VehicleType) {
        _uiState.update { it.copy(selectedVehicle = vehicleType) }
        calculateFare(vehicleType)
    }

    private fun calculateFare(vehicleType: VehicleType) {
        viewModelScope.launch {
            // MANA RIDE Formula: distance_km * rate_per_km (Zero base fare)
            val estimate = repository.estimateFare(
                pickup = _uiState.value.pickupAddress,
                destination = _uiState.value.destinationAddress,
                vehicleType = vehicleType,
                distanceKm = _uiState.value.distanceKm
            )
            _uiState.update { it.copy(fareEstimate = estimate.getOrNull()) }
        }
    }
}`;

  const djangoCode = `# Django REST Framework Backend Engine (Zero Base Fare Rule)
RATE_CARD = {
    'bike': 10.0,   # ₹10/km
    'scooty': 10.0, # ₹10/km
    'auto': 15.0,   # ₹15/km
    'car': 25.0,    # ₹25/km
}

class FareEstimateView(APIView):
    def post(self, request):
        serializer = FareEstimateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v_type = serializer.validated_data['vehicle_type']
        dist = serializer.validated_data['distance_km']
        rate = RATE_CARD.get(v_type, 25.0)
        
        # Zero Base Fare Formula:
        base_fare = 0.0
        distance_fare = dist * rate
        taxes = round(distance_fare * 0.05, 2)
        total = round(distance_fare + taxes, 2)
        
        return Response({
            'distance_km': dist,
            'travel_time_mins': int(dist * 1.68),
            'rate_per_km': rate,
            'base_fare': 0.0,
            'distance_fare': distance_fare,
            'taxes_and_fees': taxes,
            'total_fare': total
        })`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 p-4 flex flex-col gap-3.5 text-xs rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-white text-sm">MANA RIDE Architecture Inspector</span>
          <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-700">
            {currentScreenName}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['KOTLIN', 'DJANGO', 'NAV_GRAPH', 'PRICING'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Quick Jumper */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-[11px] uppercase tracking-wider">
            Quick Screen Navigation (All 15 Screens)
          </span>
          <span className="text-[10px] text-slate-400">Click any screen to jump</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {screensList.map((s) => (
            <button
              key={s.id}
              onClick={() => onJumpToScreen(s.id)}
              className={`p-2 rounded-xl text-left truncate transition-all text-[11px] font-semibold border cursor-pointer ${
                s.category === 'Driver'
                  ? 'bg-slate-900 text-indigo-300 border-slate-800 hover:border-indigo-500'
                  : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-indigo-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 font-mono relative">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
          <span className="text-[11px] text-indigo-400 font-bold">
            {activeTab === 'KOTLIN'
              ? 'Kotlin MVVM Repository Pattern (Jetpack Compose + Retrofit)'
              : activeTab === 'DJANGO'
              ? 'Django REST Framework Backend (PostgreSQL + API Views)'
              : activeTab === 'NAV_GRAPH'
              ? 'Jetpack Compose NavHost & Navigation Graph'
              : 'MANA RIDE Zero-Base-Fare Pricing Formula'}
          </span>
          <button
            onClick={() => handleCopy(activeTab === 'DJANGO' ? djangoCode : kotlinCode)}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <pre className="overflow-x-auto text-[11px] text-slate-300 leading-relaxed max-h-48 font-mono">
          {activeTab === 'KOTLIN' && kotlinCode}
          {activeTab === 'DJANGO' && djangoCode}
          {activeTab === 'NAV_GRAPH' &&
            `NavHost(navController = navController, startDestination = "customer_home") {
    composable("splash") { SplashScreen(navController) }
    composable("login") { CustomerLoginScreen(navController) }
    composable("customer_home") { CustomerHomeScreen(navController) }
    composable("vehicle_selection") { VehicleSelectionScreen(navController) }
    composable("fare_details") { FareDetailsScreen(navController) }
    composable("searching_driver") { SearchingDriverScreen(navController) }
    composable("driver_assigned") { DriverAssignedScreen(navController) }
    composable("ride_in_progress") { RideInProgressScreen(navController) }
    composable("ride_completed") { RideCompletedScreen(navController) }
    composable("ride_history") { RideHistoryScreen(navController) }
    composable("driver_dashboard") { DriverDashboardScreen(navController) }
    composable("driver_earnings") { DriverEarningsScreen(navController) }
}`}
          {activeTab === 'PRICING' &&
            `// MANA RIDE Exact Pricing Rule Set
// Bike: ₹10 / km
// Scooty: ₹10 / km
// Auto: ₹15 / km
// Car: ₹25 / km
// Base Fare: ₹0.00 (Strictly No Base Fare)
// Formula: total_fare = distance_km * rate_per_km + (distance_km * rate_per_km * 0.05)`}
        </pre>
      </div>
    </div>
  );
};
