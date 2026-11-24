package com.ewallet.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ewallet.app.ui.WalletUiState
import com.ewallet.app.ui.theme.Brand
import com.ewallet.app.ui.theme.InkSoft
import com.ewallet.app.ui.theme.Muted
import java.text.NumberFormat
import java.util.Locale

@Composable
fun TransferScreen(
    state: WalletUiState,
    onTransfer: (String, Int, String) -> Unit,
    onRefreshDirectory: () -> Unit,
    onClearFlash: () -> Unit,
) {
    var toUsername by rememberSaveable { mutableStateOf("") }
    var amount by rememberSaveable { mutableStateOf("100") }
    var note by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(Unit) { onRefreshDirectory() }
    LaunchedEffect(state.message, state.error) {
        if (!state.message.isNullOrBlank() || !state.error.isNullOrBlank()) {
            kotlinx.coroutines.delay(2500)
            onClearFlash()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text(text = "转赠积分", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text(
            text = "将积分转赠予其他会员。备注不可包含公式。",
            color = InkSoft,
            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "可转赠余额 ${NumberFormat.getIntegerInstance(Locale.TRADITIONAL_CHINESE).format(state.user?.balance ?: 0)}",
            color = Brand,
        )

        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = toUsername,
            onValueChange = { toUsername = it },
            label = { Text("收款会员用户名") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(10.dp))
        OutlinedTextField(
            value = amount,
            onValueChange = { amount = it.filter { ch -> ch.isDigit() } },
            label = { Text("转赠数量") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(10.dp))
        OutlinedTextField(
            value = note,
            onValueChange = { note = it.take(120) },
            label = { Text("备注（可选）") },
            modifier = Modifier.fillMaxWidth(),
        )
        if (!state.message.isNullOrBlank()) Text(text = state.message, color = Brand)
        if (!state.error.isNullOrBlank()) Text(text = state.error!!, color = Brand)
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = {
                val value = amount.toIntOrNull() ?: 0
                onTransfer(toUsername, value, note)
            },
            enabled = !state.loading && toUsername.isNotBlank() && (amount.toIntOrNull() ?: 0) > 0,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (state.loading) "提交中…" else "确认转赠")
        }

        Spacer(Modifier.height(20.dp))
        Text(text = "可转赠会员", color = Muted)
        state.directory.forEach { member ->
            Spacer(Modifier.height(8.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { toUsername = member.username },
            ) {
                Column(Modifier.padding(14.dp)) {
                    Text(member.displayName, style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
                    Text("@${member.username} · ${member.memberId}", color = Muted)
                }
            }
        }
    }
}
