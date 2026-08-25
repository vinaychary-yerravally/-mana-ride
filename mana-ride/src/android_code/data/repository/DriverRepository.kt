package com.manaride.app.data.repository

import com.manaride.app.data.api.ManaRideApiService
import com.manaride.app.data.model.*

interface DriverRepository {
    suspend fun getDriverStats(): Result<DriverStatsDto>
    suspend fun updateOnlineStatus(isOnline: Boolean): Result<Boolean>
    suspend fun getPendingRideRequest(): Result<RideRequestDto?>
    suspend fun acceptRide(rideId: String): Result<RideRequestDto>
    suspend fun declineRide(rideId: String): Result<Boolean>
    suspend fun notifyArrivedAtPickup(rideId: String): Result<Boolean>
    suspend fun startRide(rideId: String, pin: String): Result<RideRequestDto>
    suspend fun completeRide(rideId: String): Result<Map<String, Any>>
}

class DriverRepositoryImpl(
    private val apiService: ManaRideApiService
) : DriverRepository {

    private var cachedOnlineStatus = false

    override suspend fun getDriverStats(): Result<DriverStatsDto> {
        return try {
            val response = apiService.getDriverStats()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(mockDriverStats)
            }
        } catch (e: Exception) {
            Result.success(mockDriverStats)
        }
    }

    override suspend fun updateOnlineStatus(isOnline: Boolean): Result<Boolean> {
        cachedOnlineStatus = isOnline
        return try {
            val response = apiService.updateDriverOnlineStatus(mapOf("is_online" to isOnline))
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun getPendingRideRequest(): Result<RideRequestDto?> {
        return try {
            val response = apiService.getPendingRideRequest()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body())
            } else {
                Result.success(mockPendingRequest)
            }
        } catch (e: Exception) {
            Result.success(mockPendingRequest)
        }
    }

    override suspend fun acceptRide(rideId: String): Result<RideRequestDto> {
        return try {
            val response = apiService.acceptRide(rideId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(mockPendingRequest.copy(status = RideStatus.ACCEPTED))
            }
        } catch (e: Exception) {
            Result.success(mockPendingRequest.copy(status = RideStatus.ACCEPTED))
        }
    }

    override suspend fun declineRide(rideId: String): Result<Boolean> {
        return try {
            val response = apiService.declineRide(rideId)
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun notifyArrivedAtPickup(rideId: String): Result<Boolean> {
        return try {
            val response = apiService.notifyArrivedAtPickup(rideId)
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun startRide(rideId: String, pin: String): Result<RideRequestDto> {
        return try {
            val response = apiService.startRide(rideId, mapOf("pin" to pin))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(mockPendingRequest.copy(status = RideStatus.IN_PROGRESS))
            }
        } catch (e: Exception) {
            Result.success(mockPendingRequest.copy(status = RideStatus.IN_PROGRESS))
        }
    }

    override suspend fun completeRide(rideId: String): Result<Map<String, Any>> {
        return try {
            val response = apiService.completeRide(rideId)
            Result.success(response.body() ?: mapOf("total_earnings" to 240.0, "status" to "COMPLETED"))
        } catch (e: Exception) {
            Result.success(mapOf("total_earnings" to 240.0, "status" to "COMPLETED"))
        }
    }

    private val mockDriverStats = DriverStatsDto(
        isOnline = false,
        todayEarnings = 142.50,
        yesterdayChangePct = 12.0,
        weeklyEarnings = 840.20,
        totalRidesCount = 34,
        hoursOnline = 0.0,
        weeklyTrend = listOf(
            DayEarningDto("M", 35.0),
            DayEarningDto("T", 65.0),
            DayEarningDto("W", 50.0),
            DayEarningDto("T", 95.0),
            DayEarningDto("F", 142.0, isHighlight = true),
            DayEarningDto("S", 25.0),
            DayEarningDto("S", 15.0)
        ),
        recentRides = listOf(
            RecentRideDto("r1", "Downtown to Airport", "Today, 2:45 PM • 12.4 mi", "12.4 mi", 34.50, "Completed"),
            RecentRideDto("r2", "Uptown to Central Sta.", "Today, 11:30 AM • 4.2 mi", "4.2 mi", 14.20, "Completed"),
            RecentRideDto("r3", "Westside Mall to Home", "Today, 9:15 AM • 8.7 mi", "8.7 mi", 22.80, "Completed")
        )
    )

    private val mockPendingRequest = RideRequestDto(
        id = "REQ-991",
        customerId = "cust-rahul",
        customerName = "Rahul S.",
        customerPhone = "+91 98123 45678",
        customerRating = 4.8,
        customerAvatar = null,
        pickupAddress = "Bandra West Station, Station Road",
        pickupCoords = Coordinates(19.0544, 72.8402),
        destinationAddress = "Phoenix Palladium Mall, Lower Parel, Mumbai",
        destinationCoords = Coordinates(18.9953, 72.8242),
        distanceKm = 12.0,
        travelTimeMins = 35,
        vehicleType = VehicleType.CAR,
        ratePerKm = 25.0,
        baseFare = 0.0,
        distanceFare = 240.0,
        taxesAndFees = 0.0,
        totalFare = 240.0,
        pin = "8291",
        status = RideStatus.REQUESTED,
        driver = null,
        createdAt = "2026-08-23T09:30:00Z"
    )
}
