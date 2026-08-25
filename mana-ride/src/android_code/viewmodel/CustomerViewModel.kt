package com.manaride.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.manaride.app.data.model.*
import com.manaride.app.data.repository.RideRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CustomerUiState(
    val selectedVehicle: VehicleType = VehicleType.CAR,
    val pickupAddress: String = "1st Block Koramangala",
    val destinationAddress: String = "Kempegowda Int'l Airport",
    val pickupCoords: Coordinates = Coordinates(12.9352, 77.6245),
    val destinationCoords: Coordinates = Coordinates(13.1986, 77.7066),
    val distanceKm: Double = 38.5,
    val fareEstimate: FareEstimateResponse? = null,
    val currentRide: RideRequestDto? = null,
    val rideStatus: RideStatus = RideStatus.IDLE,
    val rideHistory: List<RideHistoryItemDto> = emptyList(),
    val customerProfile: CustomerDto? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val userRatingInput: Int = 5,
    val feedbackInput: String = ""
)

class CustomerViewModel(
    private val repository: RideRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CustomerUiState())
    val uiState: StateFlow<CustomerUiState> = _uiState.asStateFlow()

    init {
        loadProfile()
        calculateEstimate(VehicleType.CAR)
        loadRideHistory()
    }

    fun selectVehicle(vehicleType: VehicleType) {
        _uiState.update { it.copy(selectedVehicle = vehicleType) }
        calculateEstimate(vehicleType)
    }

    fun setAddresses(pickup: String, destination: String) {
        _uiState.update {
            it.copy(pickupAddress = pickup, destinationAddress = destination)
        }
        calculateEstimate(_uiState.value.selectedVehicle)
    }

    private fun calculateEstimate(vehicleType: VehicleType) {
        viewModelScope.launch {
            val result = repository.estimateFare(
                _uiState.value.pickupAddress,
                _uiState.value.destinationAddress,
                vehicleType,
                _uiState.value.distanceKm
            )
            result.onSuccess { estimate ->
                _uiState.update { it.copy(fareEstimate = estimate) }
            }
        }
    }

    fun bookRide() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, rideStatus = RideStatus.SEARCHING) }
            val result = repository.requestRide(
                pickupAddress = _uiState.value.pickupAddress,
                pickupCoords = _uiState.value.pickupCoords,
                destinationAddress = _uiState.value.destinationAddress,
                destinationCoords = _uiState.value.destinationCoords,
                vehicleType = _uiState.value.selectedVehicle
            )
            result.onSuccess { ride ->
                _uiState.update {
                    it.copy(
                        currentRide = ride,
                        rideStatus = RideStatus.ACCEPTED,
                        isLoading = false
                    )
                }
            }.onFailure { error ->
                _uiState.update {
                    it.copy(isLoading = false, errorMessage = error.message)
                }
            }
        }
    }

    fun cancelRide() {
        val rideId = _uiState.value.currentRide?.id ?: return
        viewModelScope.launch {
            repository.cancelRide(rideId)
            _uiState.update { it.copy(rideStatus = RideStatus.CANCELLED, currentRide = null) }
        }
    }

    fun updateRating(rating: Int) {
        _uiState.update { it.copy(userRatingInput = rating) }
    }

    fun updateFeedback(feedback: String) {
        _uiState.update { it.copy(feedbackInput = feedback) }
    }

    fun submitRating() {
        val rideId = _uiState.value.currentRide?.id ?: "RIDE-2026-08"
        viewModelScope.launch {
            repository.rateRide(
                rideId = rideId,
                rating = _uiState.value.userRatingInput,
                feedback = _uiState.value.feedbackInput
            )
            _uiState.update { it.copy(rideStatus = RideStatus.IDLE, currentRide = null) }
        }
    }

    fun loadRideHistory(filter: String? = null) {
        viewModelScope.launch {
            val result = repository.getRideHistory(filter)
            result.onSuccess { history ->
                _uiState.update { it.copy(rideHistory = history) }
            }
        }
    }

    private fun loadProfile() {
        viewModelScope.launch {
            repository.getCustomerProfile().onSuccess { profile ->
                _uiState.update { it.copy(customerProfile = profile) }
            }
        }
    }
}
