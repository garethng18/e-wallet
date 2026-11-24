package com.ewallet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.QrCode2
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.ewallet.app.ui.WalletUiState
import com.ewallet.app.ui.theme.Brand
import com.ewallet.app.ui.theme.Ink
import com.ewallet.app.ui.theme.InkSoft
import com.ewallet.app.ui.theme.Muted
import java.text.NumberFormat
import java.util.Locale

@Composable
fun WalletScreen(
    state: WalletUiState,
    onLogout: () -> Unit,
    onRefresh: () -> Unit,
) {
    val user = state.user
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top,
        ) {
            Column {
                Text(text = "E Wallet", color = Brand, style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
                Text(
                    text = "你好，${user?.displayName ?: ""}",
                    color = InkSoft,
                    style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
                )
            }
            IconButton(onClick = onLogout) {
                Icon(Icons.Outlined.Logout, contentDescription = "Logout", tint = Ink)
            }
        }

        Spacer(Modifier.height(20.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFFC8102E), Color(0xFF8F0F28), Color(0xFF5C1A24)),
                    ),
                )
                .padding(24.dp),
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(text = "AIA友Point 风格", color = Color.White.copy(alpha = 0.9f))
                    Icon(Icons.Outlined.QrCode2, contentDescription = null, tint = Color.White.copy(alpha = 0.85f))
                }
                Spacer(Modifier.height(28.dp))
                Text(text = "可用积分余额", color = Color.White.copy(alpha = 0.8f))
                Text(
                    text = NumberFormat.getIntegerInstance(Locale.TRADITIONAL_CHINESE)
                        .format(user?.balance ?: 0),
                    color = Color.White,
                    style = androidx.compose.material3.MaterialTheme.typography.displayLarge,
                )
                Spacer(Modifier.height(24.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text(text = "会员 ID", color = Color.White.copy(alpha = 0.7f))
                        Text(text = user?.memberId.orEmpty(), color = Color.White)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "用户名", color = Color.White.copy(alpha = 0.7f))
                        Text(text = user?.username.orEmpty(), color = Color.White)
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Text(
            text = "数据来源：Google Sheet（经 Apps Script 网关）",
            color = Muted,
            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
        )
        TextButton(onClick = onRefresh) {
            Text("刷新余额", color = Brand)
        }
        if (!state.error.isNullOrBlank()) {
            Text(text = state.error, color = Brand)
        }
    }
}
