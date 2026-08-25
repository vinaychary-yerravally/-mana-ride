"""
Django REST Framework Backend for MANA RIDE
PostgreSQL compatible models, serializers, views, and pricing calculation engine.
Pricing:
- Bike: ₹10/km
- Scooty: ₹10/km
- Auto: ₹15/km
- Car: ₹25/km
- Base Fare: ₹0.00 (No base fare applied)
- Formula: distance_km * rate_per_km
"""

# ==============================================================================
# 1. models.py
# ==============================================================================
MODELS_PY = """
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('DRIVER', 'Driver'),
    )
    phone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_rides = models.PositiveIntegerField(default=0)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

class Vehicle(models.Model):
    TYPE_CHOICES = (
        ('bike', 'Bike (₹10/km)'),
        ('scooty', 'Scooty (₹10/km)'),
        ('auto', 'Auto (₹15/km)'),
        ('car', 'Car (₹25/km)'),
    )
    driver = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vehicle')
    vehicle_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    model_name = models.CharField(max_length=100) # e.g. Swift Dzire, Activa
    license_plate = models.CharField(max_length=30, unique=True) # e.g. MH 12 AB 1234
    color = models.CharField(max_length=30, default='White')
    is_online = models.BooleanField(default=False)
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

class Ride(models.Model):
    STATUS_CHOICES = (
        ('REQUESTED', 'Requested'),
        ('ACCEPTED', 'Accepted'),
        ('ARRIVED', 'Arrived at Pickup'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_rides')
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_rides')
    
    pickup_address = models.CharField(max_length=255)
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    destination_address = models.CharField(max_length=255)
    destination_lat = models.DecimalField(max_digits=9, decimal_places=6)
    destination_lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    vehicle_type = models.CharField(max_length=20)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    rate_per_km = models.DecimalField(max_digits=6, decimal_places=2)
    
    base_fare = models.DecimalField(max_digits=6, decimal_places=2, default=0.00) # Strictly ₹0
    distance_fare = models.DecimalField(max_digits=8, decimal_places=2)
    taxes_and_fees = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_fare = models.DecimalField(max_digits=8, decimal_places=2)
    
    pin = models.CharField(max_length=6, default='8291')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
"""

# ==============================================================================
# 2. serializers.py
# ==============================================================================
SERIALIZERS_PY = """
from rest_framework import serializers
from .models import User, Vehicle, Ride

class FareEstimateSerializer(serializers.Serializer):
    pickup_address = serializers.CharField()
    destination_address = serializers.CharField()
    vehicle_type = serializers.ChoiceField(choices=['bike', 'scooty', 'auto', 'car'])
    distance_km = serializers.FloatField(min_value=0.1)

class RideSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    driver_plate = serializers.CharField(source='driver.vehicle.license_plate', read_only=True)
    driver_vehicle_model = serializers.CharField(source='driver.vehicle.model_name', read_only=True)

    class Meta:
        model = Ride
        fields = '__all__'
"""

# ==============================================================================
# 3. views.py
# ==============================================================================
VIEWS_PY = """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Ride, Vehicle
from .serializers import FareEstimateSerializer, RideSerializer

RATE_CARD = {
    'bike': 10.0,
    'scooty': 10.0,
    'auto': 15.0,
    'car': 25.0,
}

class FareEstimateView(APIView):
    def post(self, request):
        serializer = FareEstimateSerializer(data=request.data)
        if serializer.is_valid():
            v_type = serializer.validated_data['vehicle_type']
            dist = serializer.validated_data['distance_km']
            rate = RATE_CARD.get(v_type, 25.0)
            
            # MANA RIDE Formula: distance_km * rate_per_km (No base fare)
            base_fare = 0.0
            distance_fare = dist * rate
            taxes = round(distance_fare * 0.05, 2)
            total = round(distance_fare + taxes, 2)
            
            return Response({
                'distance_km': dist,
                'travel_time_mins': int(dist * 1.68),
                'rate_per_km': rate,
                'base_fare': base_fare,
                'distance_fare': distance_fare,
                'taxes_and_fees': taxes,
                'total_fare': total
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RideRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Implementation of ride request creation & driver dispatching logic
        return Response({'status': 'REQUESTED', 'pin': '8291'})
"""

# ==============================================================================
# 4. urls.py
# ==============================================================================
URLS_PY = """
from django.urls import path
from .views import FareEstimateView, RideRequestView

urlpatterns = [
    path('api/v1/rides/estimate/', FareEstimateView.as_view(), name='fare-estimate'),
    path('api/v1/rides/request/', RideRequestView.as_view(), name='ride-request'),
]
"""
