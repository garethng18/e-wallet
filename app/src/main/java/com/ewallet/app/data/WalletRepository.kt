package com.ewallet.app.data

class WalletRepository(
    private val api: SheetsApiClient,
    private val sessionStore: SessionStore,
) {
    fun isConfigured() = api.isConfigured()
    fun hasSession() = !sessionStore.token.isNullOrBlank()
    fun apiBaseUrl() = sessionStore.apiBaseUrl
    fun savedUsername() = sessionStore.username

    fun updateApiBaseUrl(url: String) {
        sessionStore.apiBaseUrl = url
    }

    suspend fun login(username: String, password: String): Result<PublicUser> {
        val response = api.post(
            "login",
            mapOf(
                "username" to username.trim(),
                "password" to password,
            ),
        )
        val user = response.user
        val token = response.token
        if (!response.ok || user == null || token.isNullOrBlank()) {
            return Result.failure(IllegalStateException(response.error ?: "Login failed"))
        }
        sessionStore.token = token
        sessionStore.username = user.username
        return Result.success(user)
    }

    suspend fun logout() {
        runCatching { api.post("logout") }
        sessionStore.clearSession()
    }

    suspend fun me(): Result<PublicUser> {
        val response = api.post("me")
        val user = response.user
        return if (response.ok && user != null) {
            Result.success(user)
        } else {
            if (response.error?.contains("Unauthorized", ignoreCase = true) == true) {
                sessionStore.clearSession()
            }
            Result.failure(IllegalStateException(response.error ?: "Unable to load wallet"))
        }
    }

    suspend fun directory(): Result<List<DirectoryUser>> {
        val response = api.post("directory")
        return if (response.ok) Result.success(response.users)
        else Result.failure(IllegalStateException(response.error ?: "Unable to load members"))
    }

    suspend fun transactions(): Result<List<WalletTransaction>> {
        val response = api.post("transactions")
        return if (response.ok) Result.success(response.transactions)
        else Result.failure(IllegalStateException(response.error ?: "Unable to load history"))
    }

    suspend fun earn(taskId: String): Result<PublicUser> {
        val response = api.post("earn", mapOf("taskId" to taskId))
        val user = response.user
        return if (response.ok && user != null) Result.success(user)
        else Result.failure(IllegalStateException(response.error ?: "Earn failed"))
    }

    suspend fun redeem(rewardId: String): Result<PublicUser> {
        val response = api.post("redeem", mapOf("rewardId" to rewardId))
        val user = response.user
        return if (response.ok && user != null) Result.success(user)
        else Result.failure(IllegalStateException(response.error ?: "Redeem failed"))
    }

    suspend fun transfer(toUsername: String, amount: Int, note: String): Result<PublicUser> {
        val response = api.post(
            "transfer",
            mapOf(
                "toUsername" to toUsername.trim(),
                "amount" to amount.toString(),
                "note" to note.trim(),
            ),
        )
        val user = response.user
        return if (response.ok && user != null) Result.success(user)
        else Result.failure(IllegalStateException(response.error ?: "Transfer failed"))
    }
}
