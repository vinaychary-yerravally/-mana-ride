package com.manaride.app.data.model

import com.google.gson.annotations.SerializedName

enum class VehicleType(val displayName: String, val ratePerKm: Double, val defaultEtaMins: Int) {
    @SerializedName("bike")
    BIKE("Bike", 10.0, 2),

    @SerializedName("scooty")
    SCOOTY("Scooty", 10.0, 3),

    @SerializedName("auto")
    AUTO("Auto", 15.0, 5),

    @SerializedName("car")
    CAR("Car", 25.0, 4)
}

enum class RideStatus {
    @SerializedName("IDLE")
    IDLE,
    @SerializedName("REQUESTED")
    REQUESTED,
    @SerializedName("SEARCHING")
    SEARCHING,
    @SerializedName("ACCEPTED")
    ACCEPTED,
    @SerializedName("ARRIVED")
    ARRIVED,
    @SerializedName("IN_PROGRESS")
    IN_PROGRESS,
    @SerializedName("COMPLETED")
    COMPLETED,
    @SerializedName("CANCELLED")
    CANCELLED
}

data class Coordinates(
    @SerializedName("lat") val lat: Double,
    @SerializedName("lng") val lng: Double
)

data class DriverDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("rating") val rating: Double,
    @SerializedName("total_rides") val totalRides: Int,
    @SerializedName("vehicle_model") val vehicleModel: String,
    @SerializedName("vehicle_plate") val vehiclePlate: String,
    @SerializedName("vehicle_color") val vehicleColor: String,
    @SerializedName("vehicle_type") val vehicleType: VehicleType,
    @SerializedName("phone") val phone: String,
    @SerializedName("avatar_url") val avatarUrl: String?,
    @SerializedName("current_coords") val currentCoords: Coordinates?
)

data class CustomerDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("email") val email: String,
    @SerializedName("rating") val rating: Double,
    @SerializedName("total_rides") val totalRides: Int,
    @SerializedName("membership_years") val membershipYears: Int,
    @SerializedName("member_tier") val memberTier: String,
    @SerializedName("avatar_url") val avatarUrl: String?
)

data class FareEstimateRequest(
    @SerializedName("pickup_address") val pickupAddress: String,
    @SerializedName("destination_address") val destinationAddress: String,
    @SerializedName("vehicle_type") val vehicleType: VehicleType,
    @SerializedName("distance_km") val distanceKm: Double
)

data class FareEstimateResponse(
    @SerializedName("distance_km") val distanceKm: Double,
    @SerializedName("travel_time_mins") val travelTimeMins: Int,
    @SerializedName("rate_per_km") val ratePerKm: Double,
    @SerializedName("base_fare") val baseFare: Double = 0.0, // Strictly 0 per MANA RIDE spec
    @SerializedName("distance_fare") val distanceFare: Double,
    @SerializedName("taxes_and_fees") val taxesAndFees: Double,
    @SerializedName("total_fare") val totalFare: Double
)

data class RideRequestDto(
    @SerializedName("id") val id: String,
    @SerializedName("customer_id") val customerId: String,
    @SerializedName("customer_name") val customerName: String,
    @SerializedName("customer_phone") val customerPhone: String,
    @SerializedName("customer_rating") val customerRating: Double,
    @SerializedName("customer_avatar") val customerAvatar: String?,
    @SerializedName("pickup_address") val pickupAddress: String,
    @SerializedName("pickup_coords") val pickupCoords: Coordinates,
    @SerializedName("destination_address") val destinationAddress: String,
    @SerializedName("destination_coords") val destinationCoords: Coordinates,
    @SerializedName("distance_km") val distanceKm: Double,
    @SerializedName("travel_time_mins") val travelTimeMins: Int,
    @SerializedName("vehicle_type") val vehicleType: VehicleType,
    @SerializedName("rate_per_km") val ratePerKm: Double,
    @SerializedName("base_fare") val baseFare: Double = 0.0,
    @SerializedName("distance_fare") val distanceFare: Double,
    @SerializedName("taxes_and_fees") val taxesAndFees: Double,
    @SerializedName("total_fare") val totalFare: Double,
    @SerializedName("pin") val pin: String = "8291",
    @SerializedName("status") val status: RideStatus,
    @SerializedName("driver") val driver: DriverDto?,
    @SerializedName("created_at") val createdAt: String
)

data class DriverStatsDto(
    @SerializedName("is_online") val isOnline: Boolean,
    @SerializedName("today_earnings") val todayEarnings: Double,
    @SerializedName("yesterday_change_pct") val yesterdayChangePct: Double,
    @SerializedName("weekly_earnings") val weeklyEarnings: Double,
    @SerializedName("total_rides_count") val totalRidesCount: Int,
    @SerializedName("hours_online") val hoursOnline: Double,
    @SerializedName("weekly_trend") val weeklyTrend: List<DayEarningDto>,
    @SerializedName("recent_rides") val recentRides: List<RecentRideDto>
)

data class DayEarningDto(
    @SerializedName("day") val day: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("is_highlight") val isHighlight: Boolean = false
)

data class RecentRideDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("distance") val distance: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("status") val status: String
)

data class RideHistoryItemDto(
    @SerializedName("id") val id: String,
    @SerializedName("date") val date: String,
    @SerializedName("time") val time: String,
    @SerializedName("vehicle_name") val vehicleName: String,
    @SerializedName("vehicle_category") val vehicleCategory: String,
    @SerializedName("pickup_address") val pickupAddress: String,
    @SerializedName("pickup_subtext") val pickupSubtext: String,
    @SerializedName("dropoff_address") val dropoffAddress: String,
    @SerializedName("dropoff_subtext") val dropoffSubtext: String,
    @SerializedName("driver_name") val driverName: String?,
    @SerializedName("driver_rating") val driverRating: Double?,
    @SerializedName("driver_avatar") val driverAvatar: String?,
    @SerializedName("amount") val amount: Double,
    @SerializedName("status") val status: String,
    @SerializedName("distance_km") val distanceKm: Double,
    @SerializedName("duration_mins") val durationMins: Int
)

data class RateRideRequest(
    @SerializedName("rating") val rating: Int,
    @SerializedName("feedback") val feedback: String? = null
)
