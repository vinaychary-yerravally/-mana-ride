from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from rides.models import CustomerProfile, DriverProfile, VehicleType


class Command(BaseCommand):
    help = "Create/update demo vehicle types, customer, and driver records for local demo use."

    def handle(self, *args, **options):
        vehicle_specs = {
            "Bike": Decimal("10"),
            "Scooty": Decimal("10"),
            "Auto": Decimal("15"),
            "Car": Decimal("25"),
        }

        created_vehicle_count = 0
        updated_vehicle_count = 0

        for name, rate in vehicle_specs.items():
            vehicle, created = VehicleType.objects.update_or_create(
                name=name,
                defaults={
                    "icon_url": "",
                    "rate_per_km": rate,
                },
            )
            if created:
                created_vehicle_count += 1
            else:
                updated_vehicle_count += 1

        User = get_user_model()

        customer_user, _ = User.objects.get_or_create(
            username="demo_customer",
            defaults={
                "email": "demo.customer@example.com",
                "password": make_password("demo_customer_123"),
            },
        )
        if not customer_user.email:
            customer_user.email = "demo.customer@example.com"
            customer_user.save(update_fields=["email"])

        CustomerProfile.objects.update_or_create(
            user=customer_user,
            defaults={
                "phone_number": "+919900000001",
                "name": "Demo Customer",
                "email": "demo.customer@example.com",
                "profile_photo": "",
                "rating": 5.0,
            },
        )

        driver_user, _ = User.objects.get_or_create(
            username="demo_driver",
            defaults={
                "email": "demo.driver@example.com",
                "password": make_password("demo_driver_123"),
            },
        )
        if not driver_user.email:
            driver_user.email = "demo.driver@example.com"
            driver_user.save(update_fields=["email"])

        driver_vehicle = VehicleType.objects.get(name="Car")

        DriverProfile.objects.update_or_create(
            user=driver_user,
            defaults={
                "phone_number": "+919900000002",
                "name": "Demo Driver",
                "profile_photo": "",
                "vehicle_type": driver_vehicle,
                "vehicle_number": "KA-01-AB-1234",
                "is_online": True,
                "current_lat": Decimal("12.9716"),
                "current_lng": Decimal("77.5946"),
                "rating": 4.8,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded demo data: {created_vehicle_count} new vehicles, {updated_vehicle_count} updated vehicles. "
                "Customer and Driver profiles are ready."
            )
        )
        self.stdout.write(
            "Demo credentials: demo_customer / demo_customer_123 | demo_driver / demo_driver_123"
        )
