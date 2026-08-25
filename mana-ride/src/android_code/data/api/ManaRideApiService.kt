package com.manaride.app.data.api

import com.manaride.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit Interface for MANA RIDE Django REST Framework backend.
 * Endpoints are mapped cleanly and base URL is injected via Retrofit builder.
 */
interface ManaRideApiService {

    // --- Authentication ---
    @POST("api/v1/auth/login/")
    suspend fun loginWithPhone(@Body payload: Map<String, String>): Response<Map<String, Any>>

    @GET("api/v1/auth/profile/")
    suspend fun getCustomerProfile(): Response<CustomerDto>

    // --- Vehicle & Pricing ---
    @GET("api/v1/vehicles/")
    suspend fun getAvailableVehicles(): Response<List<VehicleType>>

    @POST("api/v1/rides/estimate/")
    suspend fun estimateFare(@Body request: FareEstimateRequest): Response<FareEstimateResponse>

    // --- Customer Ride Lifecycle ---
    @POST("api/v1/rides/request/")
    suspend fun requestRide(@Body payload: Map<String, Any>): Response<RideRequestDto>

    @GET("api/v1/rides/current/")
    suspend fun getCurrentRide(): Response<RideRequestDto?>

    @POST("api/v1/rides/{id}/cancel/")
    suspend fun cancelRide(@Path("id") rideId: String): Response<Map<String, Boolean>>

    @POST("api/v1/rides/{id}/rate/")
    suspend fun rateRide(
        @Path("id") rideId: String,
        @Body review: RateRideRequest
    ): Response<Map<String, Boolean>>

    @GET("api/v1/rides/history/")
    suspend fun getRideHistory(
        @Query("status") status: String? = null
    ): Response<List<RideHistoryItemDto>>

    // --- Driver Endpoints ---
    @GET("api/v1/driver/stats/")
    suspend fun getDriverStats(): Response<DriverStatsDto>

    @POST("api/v1/driver/status/")
    suspend fun updateDriverOnlineStatus(
        @Body statusPayload: Map<String, Boolean>
    ): Response<Map<String, Boolean>>

    @GET("api/v1/driver/requests/pending/")
    suspend fun getPendingRideRequest(): Response<RideRequestDto?>

    @POST("api/v1/driver/rides/{id}/accept/")
    suspend fun acceptRide(@Path("id") rideId: String): Response<RideRequestDto>

    @POST("api/v1/driver/rides/{id}/decline/")
    suspend fun declineRide(@Path("id") rideId: String): Response<Map<String, Boolean>>

    @POST("api/v1/driver/rides/{id}/arrived/")
    suspend fun notifyArrivedAtPickup(@Path("id") rideId: String): Response<Map<String, Boolean>>

    @POST("api/v1/driver/rides/{id}/start/")
    suspend fun startRide(
        @Path("id") rideId: String,
        @Body pinPayload: Map<String, String>
    ): Response<RideRequestDto>

    @POST("api/v1/driver/rides/{id}/complete/")
    suspend fun completeRide(@Path("id") rideId: String): Response<Map<String, Any>>
}
