package com.manaride.app.data.repository

import com.manaride.app.data.api.ManaRideApiService
import com.manaride.app.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.delay

interface RideRepository {
    suspend fun estimateFare(
        pickup: String,
        destination: String,
        vehicleType: VehicleType,
        distanceKm: Double
    ): Result<FareEstimateResponse>

    suspend fun requestRide(
        pickupAddress: String,
        pickupCoords: Coordinates,
        destinationAddress: String,
        destinationCoords: Coordinates,
        vehicleType: VehicleType
    ): Result<RideRequestDto>

    suspend fun cancelRide(rideId: String): Result<Boolean>
    suspend fun getCurrentRide(): Result<RideRequestDto?>
    suspend fun getRideHistory(filter: String? = null): Result<List<RideHistoryItemDto>>
    suspend fun rateRide(rideId: String, rating: Int, feedback: String?): Result<Boolean>
    suspend fun getCustomerProfile(): Result<CustomerDto>
}

class RideRepositoryImpl(
    private val apiService: ManaRideApiService
) : RideRepository {

    override suspend fun estimateFare(
        pickup: String,
        destination: String,
        vehicleType: VehicleType,
        distanceKm: Double
    ): Result<FareEstimateResponse> {
        return try {
            val response = apiService.estimateFare(
                FareEstimateRequest(pickup, destination, vehicleType, distanceKm)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                // Fallback computation following MANA RIDE strictly zero-base-fare formula:
                val rate = vehicleType.ratePerKm
                val distFare = distanceKm * rate
                val taxes = (distFare * 0.05)
                val total = distFare + taxes
                Result.success(
                    FareEstimateResponse(
                        distanceKm = distanceKm,
                        travelTimeMins = (distanceKm * 1.68).toInt(),
                        ratePerKm = rate,
                        baseFare = 0.0,
                        distanceFare = distFare,
                        taxesAndFees = taxes,
                        totalFare = total
                    )
                )
            }
        } catch (e: Exception) {
            // Local calculation fallback
            val rate = vehicleType.ratePerKm
            val distFare = distanceKm * rate
            val taxes = (distFare * 0.05)
            Result.success(
                FareEstimateResponse(
                    distanceKm = distanceKm,
                    travelTimeMins = (distanceKm * 1.68).toInt(),
                    ratePerKm = rate,
                    baseFare = 0.0,
                    distanceFare = distFare,
                    taxesAndFees = taxes,
                    totalFare = distFare + taxes
                )
            )
        }
    }

    override suspend fun requestRide(
        pickupAddress: String,
        pickupCoords: Coordinates,
        destinationAddress: String,
        destinationCoords: Coordinates,
        vehicleType: VehicleType
    ): Result<RideRequestDto> {
        return try {
            val payload = mapOf(
                "pickup_address" to pickupAddress,
                "pickup_lat" to pickupCoords.lat,
                "pickup_lng" to pickupCoords.lng,
                "destination_address" to destinationAddress,
                "destination_lat" to destinationCoords.lat,
                "destination_lng" to destinationCoords.lng,
                "vehicle_type" to vehicleType.name.lowercase()
            )
            val response = apiService.requestRide(payload)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                // Mock instant response for preview
                Result.success(
                    createMockRide(pickupAddress, pickupCoords, destinationAddress, destinationCoords, vehicleType)
                )
            }
        } catch (e: Exception) {
            Result.success(
                createMockRide(pickupAddress, pickupCoords, destinationAddress, destinationCoords, vehicleType)
            )
        }
    }

    override suspend fun cancelRide(rideId: String): Result<Boolean> {
        return try {
            val response = apiService.cancelRide(rideId)
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun getCurrentRide(): Result<RideRequestDto?> {
        return try {
            val response = apiService.getCurrentRide()
            Result.success(response.body())
        } catch (e: Exception) {
            Result.success(null)
        }
    }

    override suspend fun getRideHistory(filter: String?): Result<List<RideHistoryItemDto>> {
        return try {
            val response = apiService.getRideHistory(filter)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(mockHistoryList)
            }
        } catch (e: Exception) {
            Result.success(mockHistoryList)
        }
    }

    override suspend fun rateRide(rideId: String, rating: Int, feedback: String?): Result<Boolean> {
        return try {
            val response = apiService.rateRide(rideId, RateRideRequest(rating, feedback))
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun getCustomerProfile(): Result<CustomerDto> {
        return Result.success(
            CustomerDto(
                id = "cust-1",
                name = "Vinay (Alex Johnson)",
                phone = "+91 (555) 019-2834",
                email = "vinay.yerravally@gmail.com",
                rating = 4.92,
                totalRides = 142,
                membershipYears = 3,
                memberTier = "Gold Member",
                avatarUrl = null
            )
        )
    }

    private fun createMockRide(
        pickup: String,
        pCoords: Coordinates,
        dest: String,
        dCoords: Coordinates,
        vehicleType: VehicleType
    ): RideRequestDto {
        val dist = 38.5
        val rate = vehicleType.ratePerKm
        val distFare = dist * rate
        val taxes = distFare * 0.05
        return RideRequestDto(
            id = "RIDE-2026-08",
            customerId = "cust-1",
            customerName = "Vinay",
            customerPhone = "+91 98765 43210",
            customerRating = 4.9,
            customerAvatar = null,
            pickupAddress = pickup,
            pickupCoords = pCoords,
            destinationAddress = dest,
            destinationCoords = dCoords,
            distanceKm = dist,
            travelTimeMins = 65,
            vehicleType = vehicleType,
            ratePerKm = rate,
            baseFare = 0.0,
            distanceFare = distFare,
            taxesAndFees = taxes,
            totalFare = distFare + taxes,
            pin = "8291",
            status = RideStatus.ACCEPTED,
            driver = DriverDto(
                id = "drv-101",
                name = "Rajesh K.",
                rating = 4.9,
                totalRides = 4281,
                vehicleModel = "Swift Dzire",
                vehiclePlate = "MH 12 AB 1234",
                vehicleColor = "White",
                vehicleType = vehicleType,
                phone = "+91 98111 22233",
                avatarUrl = null,
                currentCoords = Coordinates(12.9360, 77.6250)
            ),
            createdAt = "2026-08-23T09:30:00Z"
        )
    }

    private val mockHistoryList = listOf(
        RideHistoryItemDto(
            id = "ride-1",
            date = "Today",
            time = "10:45 AM",
            vehicleName = "Mana Premium",
            vehicleCategory = "SUV",
            pickupAddress = "123 Tech Boulevard",
            pickupSubtext = "San Francisco, CA",
            dropoffAddress = "SF International Airport",
            dropoffSubtext = "Terminal 2 Departures",
            driverName = "Michael T.",
            driverRating = 4.9,
            driverAvatar = null,
            amount = 45.50,
            status = "Completed",
            distanceKm = 14.2,
            durationMins = 32
        ),
        RideHistoryItemDto(
            id = "ride-2",
            date = "Yesterday",
            time = "6:30 PM",
            vehicleName = "Mana Economy",
            vehicleCategory = "Sedan",
            pickupAddress = "456 Market Street",
            pickupSubtext = "Financial District",
            dropoffAddress = "789 Mission District",
            dropoffSubtext = "Mission St",
            driverName = null,
            driverRating = null,
            driverAvatar = null,
            amount = 0.0,
            status = "Cancelled",
            distanceKm = 4.5,
            durationMins = 15
        ),
        RideHistoryItemDto(
            id = "ride-3",
            date = "Oct 12",
            time = "8:15 AM",
            vehicleName = "Mana XL",
            vehicleCategory = "Minivan",
            pickupAddress = "Downtown Hotel",
            pickupSubtext = "Main Entrance",
            dropoffAddress = "Convention Center",
            dropoffSubtext = "West Hall",
            driverName = "Sarah J.",
            driverRating = 4.8,
            driverAvatar = null,
            amount = 22.00,
            status = "Completed",
            distanceKm = 8.8,
            durationMins = 20
        )
    )
}
