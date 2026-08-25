from rest_framework import serializers
from django.contrib.auth.models import User
from .models import VehicleType, CustomerProfile, DriverProfile, Ride, Rating


class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleType
        fields = ['id', 'name', 'icon_url', 'rate_per_km']


class CustomerProfileSerializer(serializers.ModelSerializer):
    userId = serializers.SerializerMethodField(source='user.id')
    
    class Meta:
        model = CustomerProfile
        fields = ['id', 'userId', 'phone_number', 'name', 'email', 'profile_photo', 'rating']
    
    def get_userId(self, obj):
        return obj.user.id if obj.user else None


class DriverProfileSerializer(serializers.ModelSerializer):
    userId = serializers.SerializerMethodField(source='user.id')
    vehicleType = serializers.SerializerMethodField()
    isOnline = serializers.BooleanField(source='is_online')
    currentLat = serializers.DecimalField(source='current_lat', max_digits=10, decimal_places=7)
    currentLng = serializers.DecimalField(source='current_lng', max_digits=10, decimal_places=7)
    vehicleNumber = serializers.CharField(source='vehicle_number')
    profilePhoto = serializers.CharField(source='profile_photo')
    
    class Meta:
        model = DriverProfile
        fields = ['id', 'userId', 'phone_number', 'name', 'profilePhoto', 'vehicleType', 'vehicleNumber', 'isOnline', 'currentLat', 'currentLng', 'rating']
    
    def get_userId(self, obj):
        return obj.user.id if obj.user else None
    
    def get_vehicleType(self, obj):
        if obj.vehicle_type:
            return {
                'id': obj.vehicle_type.id,
                'name': obj.vehicle_type.name,
                'ratePerKm': obj.vehicle_type.rate_per_km
            }
        return None


class RideSerializer(serializers.ModelSerializer):
    customerId = serializers.SerializerMethodField()
    customerName = serializers.SerializerMethodField()
    customerPhone = serializers.SerializerMethodField()
    customerRating = serializers.SerializerMethodField()
    
    driverId = serializers.SerializerMethodField()
    driver = DriverProfileSerializer(read_only=True)
    
    vehicleType = serializers.SerializerMethodField()
    
    pickupAddress = serializers.CharField(source='pickup_address')
    pickupLat = serializers.DecimalField(source='pickup_lat', max_digits=10, decimal_places=7)
    pickupLng = serializers.DecimalField(source='pickup_lng', max_digits=10, decimal_places=7)
    
    destinationAddress = serializers.CharField(source='destination_address')
    destinationLat = serializers.DecimalField(source='destination_lat', max_digits=10, decimal_places=7)
    destinationLng = serializers.DecimalField(source='destination_lng', max_digits=10, decimal_places=7)
    
    distanceKm = serializers.DecimalField(source='distance_km', max_digits=10, decimal_places=2)
    estimatedFare = serializers.DecimalField(source='estimated_fare', max_digits=10, decimal_places=2)
    finalFare = serializers.DecimalField(source='final_fare', max_digits=10, decimal_places=2, allow_null=True)
    
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Ride
        fields = [
            'id', 'customerId', 'customerName', 'customerPhone', 'customerRating',
            'driverId', 'driver',
            'pickupAddress', 'pickupLat', 'pickupLng',
            'destinationAddress', 'destinationLat', 'destinationLng',
            'vehicleType', 'distanceKm', 'estimatedFare', 'finalFare',
            'status', 'otp', 'createdAt'
        ]
    
    def get_customerId(self, obj):
        return obj.customer.id if obj.customer else None
    
    def get_customerName(self, obj):
        return obj.customer.name if obj.customer else None
    
    def get_customerPhone(self, obj):
        return obj.customer.phone_number if obj.customer else None
    
    def get_customerRating(self, obj):
        return obj.customer.rating if obj.customer else 5.0
    
    def get_driverId(self, obj):
        return obj.driver.id if obj.driver else None
    
    def get_vehicleType(self, obj):
        if obj.vehicle_type:
            return {
                'id': obj.vehicle_type.id,
                'name': obj.vehicle_type.name,
                'ratePerKm': obj.vehicle_type.rate_per_km
            }
        return None


class RatingSerializer(serializers.ModelSerializer):
    rideId = serializers.SerializerMethodField(source='ride.id')
    customerRating = serializers.IntegerField(source='customer_rating')
    customerFeedback = serializers.CharField(source='customer_feedback')
    
    class Meta:
        model = Rating
        fields = ['id', 'rideId', 'customerRating', 'customerFeedback']
    
    def get_rideId(self, obj):
        return obj.ride.id