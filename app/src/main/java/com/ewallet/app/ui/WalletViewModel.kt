package com.ewallet.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.ewallet.app.data.DirectoryUser
import com.ewallet.app.data.PublicUser
import com.ewallet.app.data.WalletRepository
import com.ewallet.app.data.WalletTransaction
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class WalletUiState(
    val loading: Boolean = false,
    val bootstrapping: Boolean = true,
    val configured: Boolean = false,
    val loggedIn: Boolean = false,
    val apiUrl: String = "",
    val user: PublicUser? = null,
    val directory: List<DirectoryUser> = emptyList(),
    val transactions: List<WalletTransaction> = emptyList(),
    val message: String? = null,
    val error: String? = null,
)

class WalletViewModel(
    private val repository: WalletRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(WalletUiState())
    val state: StateFlow<WalletUiState> = _state.asStateFlow()

    init {
        bootstrap()
    }

    private fun bootstrap() {
        viewModelScope.launch {
            val configured = repository.isConfigured()
            _state.update {
                it.copy(
                    bootstrapping = false,
                    configured = configured,
                    apiUrl = repository.apiBaseUrl(),
                    loggedIn = configured && repository.hasSession(),
                )
            }
            if (configured && repository.hasSession()) {
                refreshMe()
            }
        }
    }

    fun saveApiUrl(url: String) {
        repository.updateApiBaseUrl(url)
        _state.update {
            it.copy(
                configured = repository.isConfigured(),
                apiUrl = repository.apiBaseUrl(),
                message = "Sheets bridge URL saved",
                error = null,
            )
        }
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null, message = null) }
            repository.login(username, password)
                .onSuccess { user ->
                    _state.update {
                        it.copy(
                            loading = false,
                            loggedIn = true,
                            user = user,
                            message = "Welcome, ${user.displayName}",
                        )
                    }
                    refreshDirectory()
                    refreshTransactions()
                }
                .onFailure { err ->
                    _state.update {
                        it.copy(loading = false, error = err.message, loggedIn = false, user = null)
                    }
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
            _state.update {
                it.copy(
                    loggedIn = false,
                    user = null,
                    directory = emptyList(),
                    transactions = emptyList(),
                    message = null,
                    error = null,
                )
            }
        }
    }

    fun refreshMe() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            repository.me()
                .onSuccess { user ->
                    _state.update {
                        it.copy(loading = false, loggedIn = true, user = user)
                    }
                }
                .onFailure { err ->
                    _state.update {
                        it.copy(
                            loading = false,
                            error = err.message,
                            loggedIn = repository.hasSession(),
                        )
                    }
                }
        }
    }

    fun refreshDirectory() {
        viewModelScope.launch {
            repository.directory()
                .onSuccess { users -> _state.update { it.copy(directory = users) } }
                .onFailure { err -> _state.update { it.copy(error = err.message) } }
        }
    }

    fun refreshTransactions() {
        viewModelScope.launch {
            repository.transactions()
                .onSuccess { rows -> _state.update { it.copy(transactions = rows) } }
                .onFailure { err -> _state.update { it.copy(error = err.message) } }
        }
    }

    fun earn(taskId: String) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null, message = null) }
            repository.earn(taskId)
                .onSuccess { user ->
                    _state.update {
                        it.copy(loading = false, user = user, message = "Points earned")
                    }
                    refreshTransactions()
                }
                .onFailure { err ->
                    _state.update { it.copy(loading = false, error = err.message) }
                }
        }
    }

    fun redeem(rewardId: String) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null, message = null) }
            repository.redeem(rewardId)
                .onSuccess { user ->
                    _state.update {
                        it.copy(loading = false, user = user, message = "Reward redeemed")
                    }
                    refreshTransactions()
                }
                .onFailure { err ->
                    _state.update { it.copy(loading = false, error = err.message) }
                }
        }
    }

    fun transfer(toUsername: String, amount: Int, note: String) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null, message = null) }
            repository.transfer(toUsername, amount, note)
                .onSuccess { user ->
                    _state.update {
                        it.copy(loading = false, user = user, message = "Transfer complete")
                    }
                    refreshTransactions()
                    refreshDirectory()
                }
                .onFailure { err ->
                    _state.update { it.copy(loading = false, error = err.message) }
                }
        }
    }

    fun clearFlash() {
        _state.update { it.copy(message = null, error = null) }
    }

    class Factory(private val repository: WalletRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return WalletViewModel(repository) as T
        }
    }
}
