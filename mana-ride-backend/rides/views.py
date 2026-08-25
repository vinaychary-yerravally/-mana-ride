from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from decimal import Decimal
import random
import string
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from .models import VehicleType, Ride, Rating, CustomerProfile, DriverProfile
from .serializers import (
    VehicleTypeSerializer,
    RideSerializer,
    RatingSerializer,
    CustomerProfileSerializer,
    DriverProfileSerializer,
)


class VehicleTypeListView(generics.ListCreateAPIView):
    """Get list of all vehicle types."""
    queryset = VehicleType.objects.all()
    serializer_class = VehicleTypeSerializer


class RideEstimateView(APIView):
    """Estimate fare for a ride."""

    def post(self, request):
        try:
            data = request.data
            distance_km = Decimal(str(data.get('distanceKm', data.get('distance_km', 0))))
            vehicle_type_id = data.get('vehicleTypeId', data.get('vehicle_type_id'))

            if not vehicle_type_id or distance_km <= 0:
                return Response(
                    {'error': 'Invalid distanceKm or vehicleTypeId'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            vehicle_type = get_object_or_404(VehicleType, id=vehicle_type_id)
            distance_fare = distance_km * vehicle_type.rate_per_km
            base_fare = Decimal('0.00')
            taxes_and_fees = Decimal('0.00')
            total_fare = distance_fare
            travel_time_mins = int(distance_km * 1.68)

            return Response({
                'distanceKm': float(distance_km),
                'distance_km': float(distance_km),
                'travelTimeMins': travel_time_mins,
                'travel_time_mins': travel_time_mins,
                'ratePerKm': float(vehicle_type.rate_per_km),
                'rate_per_km': float(vehicle_type.rate_per_km),
                'baseFare': float(base_fare),
                'base_fare': float(base_fare),
                'distanceFare': float(distance_fare),
                'distance_fare': float(distance_fare),
                'taxesAndFees': float(taxes_and_fees),
                'taxes_and_fees': float(taxes_and_fees),
                'totalFare': float(total_fare),
                'estimatedFare': float(total_fare),
                'estimated_fare': float(total_fare),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RideRequestView(APIView):
    """Request a ride."""

    def post(self, request):
        try:
            data = request.data
            customer_id = data.get('customerId', data.get('customer_id'))
            if customer_id in (None, '', 'demo_customer'):
                customer = CustomerProfile.objects.filter(user__username='demo_customer').first()
                if customer is None:
                    return Response({'error': 'Demo customer not found'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                customer = get_object_or_404(CustomerProfile, id=customer_id)

            vehicle_type_id = data.get('vehicleTypeId', data.get('vehicle_type_id'))
            if vehicle_type_id is None:
                return Response({'error': 'vehicleTypeId required'}, status=status.HTTP_400_BAD_REQUEST)

            vehicle_type = get_object_or_404(VehicleType, id=vehicle_type_id)
            distance_km = Decimal(str(data.get('distanceKm', data.get('distance_km', 0))))
            estimated_fare = Decimal(str(data.get('estimatedFare', data.get('estimated_fare', 0))))

            if estimated_fare <= 0 and distance_km > 0:
                estimated_fare = distance_km * vehicle_type.rate_per_km

            otp = ''.join(random.choices(string.digits, k=4))
            ride = Ride.objects.create(
                customer=customer,
                vehicle_type=vehicle_type,
                pickup_address=data.get('pickupAddress', data.get('pickup_address')),
                pickup_lat=Decimal(str(data.get('pickupLat', data.get('pickup_lat', 0)))),
                pickup_lng=Decimal(str(data.get('pickupLng', data.get('pickup_lng', 0)))),
                destination_address=data.get('destinationAddress', data.get('destination_address')),
                destination_lat=Decimal(str(data.get('destinationLat', data.get('destination_lat', 0)))),
                destination_lng=Decimal(str(data.get('destinationLng', data.get('destination_lng', 0)))),
                distance_km=distance_km,
                estimated_fare=estimated_fare,
                status=Ride.Status.SEARCHING_DRIVER,
                otp=otp
            )

            available_driver = DriverProfile.objects.filter(
                is_online=True,
                vehicle_type=vehicle_type
            ).first()

            if available_driver:
                ride.driver = available_driver
                ride.status = Ride.Status.DRIVER_ASSIGNED
                ride.save()

            serializer = RideSerializer(ride)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RideCurrentView(APIView):
    """Get current ride for customer."""
    
    def get(self, request):
        """GET /api/rides/current/?customerId=1"""
        customer_id = request.query_params.get('customerId')
        if not customer_id or customer_id == 'demo_customer':
            customer_id = CustomerProfile.objects.filter(user__username='demo_customer').values_list('id', flat=True).first()
        if not customer_id:
            return Response({'data': None})
        
        ride = Ride.objects.filter(
            customer_id=customer_id,
            status__in=[
                Ride.Status.SEARCHING_DRIVER,
                Ride.Status.DRIVER_ASSIGNED,
                Ride.Status.DRIVER_ARRIVED,
                Ride.Status.RIDE_STARTED
            ]
        ).first()
        
        if not ride:
            return Response({'data': None})
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class RideHistoryView(APIView):
    """Get ride history for customer."""
    
    def get(self, request):
        """GET /api/rides/history/?customerId=1"""
        customer_id = request.query_params.get('customerId')
        if not customer_id or customer_id == 'demo_customer':
            customer_id = CustomerProfile.objects.filter(user__username='demo_customer').values_list('id', flat=True).first()
        if not customer_id:
            return Response([])
        
        rides = Ride.objects.filter(
            customer_id=customer_id,
            status__in=[Ride.Status.COMPLETED, Ride.Status.CANCELLED]
        ).order_by('-created_at')
        
        serializer = RideSerializer(rides, many=True)
        return Response(serializer.data)


class RideCancelView(APIView):
    """Cancel a ride."""
    
    def post(self, request, ride_id):
        """POST /api/rides/<id>/cancel/"""
        ride = get_object_or_404(Ride, id=ride_id)
        
        if ride.status not in [Ride.Status.SEARCHING_DRIVER, Ride.Status.DRIVER_ASSIGNED]:
            return Response(
                {'error': 'Cannot cancel ride in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ride.status = Ride.Status.CANCELLED
        ride.save()
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class RideRateView(APIView):
    """Rate a completed ride."""
    
    def post(self, request, ride_id):
        """
        POST /api/rides/<id>/rate/
        Body: {
            "customerRating": int (1-5),
            "customerFeedback": str
        }
        """
        ride = get_object_or_404(Ride, id=ride_id)
        
        if ride.status != Ride.Status.COMPLETED:
            return Response(
                {'error': 'Can only rate completed rides'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rating_data = {
            'customer_rating': request.data.get('customerRating', 5),
            'customer_feedback': request.data.get('customerFeedback', '')
        }

        rating, _ = Rating.objects.update_or_create(
            ride_id=ride_id,
            defaults=rating_data
        )
        
        # Update driver rating (simple average)
        if ride.driver:
            driver = ride.driver
            all_ratings = Rating.objects.filter(ride__driver=driver).values_list('customer_rating', flat=True)
            if all_ratings:
                avg_rating = Decimal(sum(all_ratings)) / len(all_ratings)
                driver.rating = avg_rating
                driver.save()
        
        serializer = RatingSerializer(rating)
        return Response(serializer.data)


# ============ DRIVER ENDPOINTS ============

class DriverStatusView(APIView):
    """Update driver online status."""
    
    def patch(self, request):
        """
        PATCH /api/driver/status/
        Body: {"driverId": int, "isOnline": bool}
        """
        driver_id = request.data.get('driverId', request.data.get('driver_id'))
        is_online = request.data.get('isOnline', request.data.get('is_online'))

        if not driver_id:
            driver_id = DriverProfile.objects.filter(user__username='demo_driver').values_list('id', flat=True).first()
        
        driver = get_object_or_404(DriverProfile, id=driver_id)
        driver.is_online = is_online
        driver.save()
        
        serializer = DriverProfileSerializer(driver)
        return Response(serializer.data)


class DriverPendingRequestsView(APIView):
    """Get pending ride requests for driver."""
    
    def get(self, request):
        """GET /api/driver/requests/?driverId=1"""
        driver_id = request.query_params.get('driverId')
        if not driver_id:
            driver_id = DriverProfile.objects.filter(user__username='demo_driver').values_list('id', flat=True).first()
        if not driver_id:
            return Response({'data': None})
        
        driver = get_object_or_404(DriverProfile, id=driver_id)
        
        # Get pending rides for this driver's vehicle type
        pending_rides = Ride.objects.filter(
            Q(status=Ride.Status.SEARCHING_DRIVER, driver__isnull=True) |
            Q(status=Ride.Status.DRIVER_ASSIGNED, driver=driver),
            vehicle_type=driver.vehicle_type
        ).first()
        
        if not pending_rides:
            return Response({'data': None})
        
        serializer = RideSerializer(pending_rides)
        return Response(serializer.data)


class DriverAcceptRideView(APIView):
    """Driver accepts a ride."""
    
    def post(self, request, ride_id):
        """POST /api/driver/rides/<id>/accept/"""
        ride = get_object_or_404(Ride, id=ride_id)
        driver_id = request.data.get('driverId', request.data.get('driver_id'))
        if not driver_id:
            driver_id = DriverProfile.objects.filter(user__username='demo_driver').values_list('id', flat=True).first()
        driver = get_object_or_404(DriverProfile, id=driver_id)
        
        ride.driver = driver
        ride.status = Ride.Status.DRIVER_ASSIGNED
        ride.save()
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class DriverDeclineRideView(APIView):
    """Driver declines a ride."""
    
    def post(self, request, ride_id):
        """POST /api/driver/rides/<id>/decline/"""
        ride = get_object_or_404(Ride, id=ride_id)
        
        # Reset driver assignment
        ride.driver = None
        ride.status = Ride.Status.SEARCHING_DRIVER
        ride.save()
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class DriverArrivedView(APIView):
    """Driver marks as arrived at pickup."""
    
    def post(self, request, ride_id):
        """POST /api/driver/rides/<id>/arrived/"""
        ride = get_object_or_404(Ride, id=ride_id)
        
        ride.status = Ride.Status.DRIVER_ARRIVED
        ride.save()
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class DriverStartRideView(APIView):
    """Driver starts the ride with OTP verification."""
    
    def post(self, request, ride_id):
        """
        POST /api/driver/rides/<id>/start/
        Body: {"otp": "1234"}
        """
        ride = get_object_or_404(Ride, id=ride_id)
        otp = request.data.get('otp')
        
        if ride.otp != otp:
            return Response(
                {'error': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ride.status = Ride.Status.RIDE_STARTED
        ride.save()
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class DriverCompleteRideView(APIView):
    """Driver completes the ride."""
    
    def post(self, request, ride_id):
        """POST /api/driver/rides/<id>/complete/"""
        ride = get_object_or_404(Ride, id=ride_id)
        
        ride.status = Ride.Status.COMPLETED
        ride.final_fare = ride.estimated_fare  # For demo, final = estimated
        ride.save()
        
        serializer = RideSerializer(ride)
        return Response(serializer.data)


class DriverEarningsView(APIView):
    """Get driver earnings."""
    
    def get(self, request):
        """GET /api/driver/earnings/?driverId=1"""
        driver_id = request.query_params.get('driverId')
        if not driver_id:
            driver_id = DriverProfile.objects.filter(user__username='demo_driver').values_list('id', flat=True).first()
        if not driver_id:
            return Response({'totalEarnings': 0, 'totalRides': 0, 'isOnline': False})
        
        driver = get_object_or_404(DriverProfile, id=driver_id)
        
        completed_rides = Ride.objects.filter(
            driver=driver,
            status=Ride.Status.COMPLETED
        )
        
        total_earnings = completed_rides.aggregate(
            total=Sum('final_fare')
        )['total'] or Decimal('0.00')
        
        total_rides = completed_rides.count()
        
        recent_rides = completed_rides.order_by('-created_at')[:10]
        return Response({
            'driverId': driver.id,
            'todayEarnings': float(total_earnings),
            'weeklyEarnings': float(total_earnings),
            'totalEarnings': float(total_earnings),
            'totalRides': total_rides,
            'totalRidesCount': total_rides,
            'recentRides': RideSerializer(recent_rides, many=True).data,
            'weeklyTrend': [],
            'rating': float(driver.rating),
            'isOnline': driver.is_online,
            'hoursOnline': 0
        })
