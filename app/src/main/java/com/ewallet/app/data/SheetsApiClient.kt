package com.ewallet.app.data

import com.ewallet.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class SheetsApiClient(
    private val sessionStore: SessionStore,
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private fun baseUrl(): String {
        val configured = sessionStore.apiBaseUrl.ifBlank { BuildConfig.SHEETS_API_BASE_URL }
        return configured.trim().trimEnd('/')
    }

    fun isConfigured(): Boolean = baseUrl().isNotBlank()

    suspend fun post(action: String, payload: Map<String, String> = emptyMap()): ApiResponse =
        withContext(Dispatchers.IO) {
            val url = baseUrl()
            if (url.isBlank()) {
                return@withContext ApiResponse(
                    ok = false,
                    error = "Set the Google Apps Script URL in Settings first.",
                )
            }

            val bodyMap = LinkedHashMap<String, String>()
            bodyMap["action"] = action
            sessionStore.token?.let { bodyMap["token"] = it }
            bodyMap.putAll(payload)

            val bodyJson = json.encodeToString(bodyMap)
            val request = Request.Builder()
                .url(url)
                .post(bodyJson.toRequestBody(JSON))
                .header("Content-Type", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                val text = response.body?.string().orEmpty()
                if (text.isBlank()) {
                    return@withContext ApiResponse(
                        ok = false,
                        error = "Empty response from Sheets bridge (${response.code})",
                    )
                }
                runCatching { json.decodeFromString<ApiResponse>(text) }
                    .getOrElse {
                        ApiResponse(ok = false, error = "Invalid response from Sheets bridge")
                    }
            }
        }

    companion object {
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
