package com.manaride.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.manaride.app.data.model.*
import com.manaride.app.data.repository.DriverRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class DriverUiState(
    val isOnline: Boolean = false,
    val stats: DriverStatsDto? = null,
    val pendingRequest: RideRequestDto? = null,
    val showRequestModal: Boolean = false,
    val requestCountdownSeconds: Int = 15,
    val activeRide: RideRequestDto? = null,
    val isAtPickup: Boolean = false,
    val pinInput: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class DriverViewModel(
    private val repository: DriverRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DriverUiState())
    val uiState: StateFlow<DriverUiState> = _uiState.asStateFlow()

    init {
        loadStats()
    }

    fun toggleOnlineStatus() {
        val newStatus = !_uiState.value.isOnline
        viewModelScope.launch {
            _uiState.update { it.copy(isOnline = newStatus) }
            repository.updateOnlineStatus(newStatus)
            if (newStatus) {
                // Simulate incoming ride request after going online
                checkPendingRequests()
            } else {
                _uiState.update { it.copy(showRequestModal = false, pendingRequest = null) }
            }
        }
    }

    fun checkPendingRequests() {
        viewModelScope.launch {
            repository.getPendingRideRequest().onSuccess { request ->
                if (request != null && _uiState.value.isOnline) {
                    _uiState.update {
                        it.copy(
                            pendingRequest = request,
                            showRequestModal = true,
                            requestCountdownSeconds = 15
                        )
                    }
                }
            }
        }
    }

    fun acceptRide(rideId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.acceptRide(rideId).onSuccess { acceptedRide ->
                _uiState.update {
                    it.copy(
                        activeRide = acceptedRide,
                        showRequestModal = false,
                        pendingRequest = null,
                        isLoading = false
                    )
                }
            }
        }
    }

    fun declineRide(rideId: String) {
        viewModelScope.launch {
            repository.declineRide(rideId)
            _uiState.update { it.copy(showRequestModal = false, pendingRequest = null) }
        }
    }

    fun arriveAtPickup() {
        val rideId = _uiState.value.activeRide?.id ?: return
        viewModelScope.launch {
            repository.notifyArrivedAtPickup(rideId)
            _uiState.update { it.copy(isAtPickup = true) }
        }
    }

    fun startRide(pin: String) {
        val rideId = _uiState.value.activeRide?.id ?: return
        viewModelScope.launch {
            repository.startRide(rideId, pin).onSuccess { inProgressRide ->
                _uiState.update { it.copy(activeRide = inProgressRide) }
            }
        }
    }

    fun completeRide() {
        val rideId = _uiState.value.activeRide?.id ?: return
        viewModelScope.launch {
            repository.completeRide(rideId)
            _uiState.update {
                it.copy(
                    activeRide = null,
                    isAtPickup = false
                )
            }
            loadStats()
        }
    }

    fun loadStats() {
        viewModelScope.launch {
            repository.getDriverStats().onSuccess { stats ->
                _uiState.update { it.copy(stats = stats) }
            }
        }
    }
}
