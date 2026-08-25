from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rides.models import VehicleType, CustomerProfile, DriverProfile
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed database with vehicle types and demo users'

    def handle(self, *args, **options):
        # Create vehicle types
        vehicles = [
            {'name': 'Bike', 'rate_per_km': Decimal('10.00')},
            {'name': 'Scooty', 'rate_per_km': Decimal('10.00')},
            {'name': 'Auto', 'rate_per_km': Decimal('15.00')},
            {'name': 'Car', 'rate_per_km': Decimal('25.00')},
        ]

        for vehicle_data in vehicles:
            vehicle, created = VehicleType.objects.get_or_create(
                name=vehicle_data['name'],
                defaults={'rate_per_km': vehicle_data['rate_per_km']}
            )
            if created:
                self.stdout.write(f'Created vehicle type: {vehicle.name}')
            else:
                self.stdout.write(f'Vehicle type already exists: {vehicle.name}')

        # Create demo customer user and profile
        customer_user, user_created = User.objects.get_or_create(
            username='democustomer',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Customer',
                'email': 'customer@demo.local'
            }
        )

        if user_created:
            customer_user.set_password('demo123')
            customer_user.save()
            self.stdout.write(f'Created demo customer user: {customer_user.username}')
        else:
            self.stdout.write(f'Demo customer user already exists: {customer_user.username}')

        customer_profile, profile_created = CustomerProfile.objects.get_or_create(
            user=customer_user,
            defaults={
                'phone_number': '+91-9876543210',
                'name': 'Demo Customer',
                'email': 'customer@demo.local',
                'profile_photo': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'rating': Decimal('4.9')
            }
        )

        if profile_created:
            self.stdout.write(f'Created demo customer profile: {customer_profile.name}')
        else:
            self.stdout.write(f'Demo customer profile already exists: {customer_profile.name}')

        # Create demo driver user and profile
        driver_user, driver_created = User.objects.get_or_create(
            username='demodriver',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Driver',
                'email': 'driver@demo.local'
            }
        )

        if driver_created:
            driver_user.set_password('demo123')
            driver_user.save()
            self.stdout.write(f'Created demo driver user: {driver_user.username}')
        else:
            self.stdout.write(f'Demo driver user already exists: {driver_user.username}')

        car_vehicle = VehicleType.objects.get(name='Car')

        driver_profile, driver_profile_created = DriverProfile.objects.get_or_create(
            user=driver_user,
            defaults={
                'phone_number': '+91-9876543211',
                'name': 'Rajesh K.',
                'profile_photo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'vehicle_type': car_vehicle,
                'vehicle_number': 'MH-12-AB-1234',
                'is_online': True,
                'current_lat': Decimal('19.0760'),
                'current_lng': Decimal('72.8777'),
                'rating': Decimal('4.9')
            }
        )

        if driver_profile_created:
            self.stdout.write(f'Created demo driver profile: {driver_profile.name}')
        else:
            self.stdout.write(f'Demo driver profile already exists: {driver_profile.name}')

        self.stdout.write(self.style.SUCCESS('✓ Seed data created successfully'))
        self.stdout.write('\n--- Demo Credentials ---')
        self.stdout.write(f'Customer ID: {customer_profile.id}')
        self.stdout.write(f'Customer Username: democustomer / Password: demo123')
        self.stdout.write(f'Driver ID: {driver_profile.id}')
        self.stdout.write(f'Driver Username: demodriver / Password: demo123')
