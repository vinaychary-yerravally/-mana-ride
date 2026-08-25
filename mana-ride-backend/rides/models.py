from django.db import models
from django.contrib.auth.models import User


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    profile_photo = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)

    def __str__(self):
        return self.name


class VehicleType(models.Model):
    name = models.CharField(max_length=50)
    icon_url = models.URLField(blank=True)
    rate_per_km = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    profile_photo = models.URLField(blank=True)
    vehicle_type = models.ForeignKey(
        VehicleType,
        on_delete=models.PROTECT
    )
    vehicle_number = models.CharField(max_length=30)
    is_online = models.BooleanField(default=False)
    current_lat = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )
    current_lng = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)

    def __str__(self):
        return self.name


class Ride(models.Model):

    class Status(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        SEARCHING_DRIVER = "SEARCHING_DRIVER", "Searching Driver"
        DRIVER_ASSIGNED = "DRIVER_ASSIGNED", "Driver Assigned"
        DRIVER_ARRIVED = "DRIVER_ARRIVED", "Driver Arrived"
        RIDE_STARTED = "RIDE_STARTED", "Ride Started"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="rides"
    )

    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rides"
    )

    pickup_address = models.TextField()
    pickup_lat = models.DecimalField(max_digits=10, decimal_places=7)
    pickup_lng = models.DecimalField(max_digits=10, decimal_places=7)

    destination_address = models.TextField()
    destination_lat = models.DecimalField(max_digits=10, decimal_places=7)
    destination_lng = models.DecimalField(max_digits=10, decimal_places=7)

    vehicle_type = models.ForeignKey(
        VehicleType,
        on_delete=models.PROTECT
    )

    distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    estimated_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    final_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.REQUESTED
    )

    otp = models.CharField(max_length=4)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ride #{self.id}: {self.pickup_address} → {self.destination_address}"


class Rating(models.Model):
    ride = models.OneToOneField(
        Ride,
        on_delete=models.CASCADE,
        related_name="rating"
    )

    customer_rating = models.PositiveIntegerField()
    customer_feedback = models.TextField(blank=True)

    def __str__(self):
        return f"Rating for Ride #{self.ride.id}"