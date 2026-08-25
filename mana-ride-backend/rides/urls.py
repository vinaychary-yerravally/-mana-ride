from django.urls import path
from .views import (
    VehicleTypeListView,
    RideEstimateView,
    RideRequestView,
    RideCurrentView,
    RideHistoryView,
    RideCancelView,
    RideRateView,
    DriverStatusView,
    DriverPendingRequestsView,
    DriverAcceptRideView,
    DriverDeclineRideView,
    DriverArrivedView,
    DriverStartRideView,
    DriverCompleteRideView,
    DriverEarningsView,
)

urlpatterns = [
    # Vehicle endpoints
    path('vehicles/', VehicleTypeListView.as_view(), name='vehicle-list'),
    
    # Customer ride endpoints
    path('rides/estimate/', RideEstimateView.as_view(), name='ride-estimate'),
    path('rides/request/', RideRequestView.as_view(), name='ride-request'),
    path('rides/current/', RideCurrentView.as_view(), name='ride-current'),
    path('rides/history/', RideHistoryView.as_view(), name='ride-history'),
    path('rides/<int:ride_id>/cancel/', RideCancelView.as_view(), name='ride-cancel'),
    path('rides/<int:ride_id>/rate/', RideRateView.as_view(), name='ride-rate'),
    
    # Driver endpoints
    path('driver/status/', DriverStatusView.as_view(), name='driver-status'),
    path('driver/requests/', DriverPendingRequestsView.as_view(), name='driver-requests'),
    path('driver/rides/<int:ride_id>/accept/', DriverAcceptRideView.as_view(), name='driver-accept'),
    path('driver/rides/<int:ride_id>/decline/', DriverDeclineRideView.as_view(), name='driver-decline'),
    path('driver/rides/<int:ride_id>/arrived/', DriverArrivedView.as_view(), name='driver-arrived'),
    path('driver/rides/<int:ride_id>/start/', DriverStartRideView.as_view(), name='driver-start'),
    path('driver/rides/<int:ride_id>/complete/', DriverCompleteRideView.as_view(), name='driver-complete'),
    path('driver/earnings/', DriverEarningsView.as_view(), name='driver-earnings'),
]
