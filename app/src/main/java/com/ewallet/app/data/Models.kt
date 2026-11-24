package com.ewallet.app.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PublicUser(
    @SerialName("userId") val userId: String,
    val username: String,
    val displayName: String,
    val balance: Int,
    val memberId: String,
    val status: String = "active",
)

@Serializable
data class WalletTransaction(
    val txnId: String,
    val fromUserId: String,
    val toUserId: String,
    val type: String,
    val amount: Int,
    val note: String,
    val createdAt: String,
)

@Serializable
data class DirectoryUser(
    val userId: String,
    val username: String,
    val displayName: String,
    val memberId: String,
)

@Serializable
data class ApiResponse(
    val ok: Boolean = false,
    val error: String? = null,
    val token: String? = null,
    val user: PublicUser? = null,
    val users: List<DirectoryUser> = emptyList(),
    val transactions: List<WalletTransaction> = emptyList(),
    val transaction: WalletTransaction? = null,
)
