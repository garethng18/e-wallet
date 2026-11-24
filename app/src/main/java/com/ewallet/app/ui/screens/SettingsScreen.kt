package com.ewallet.app.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ewallet.app.ui.WalletUiState
import com.ewallet.app.ui.theme.InkSoft
import com.ewallet.app.ui.theme.Muted

@Composable
fun SettingsScreen(
    state: WalletUiState,
    onSave: (String) -> Unit,
    onBack: (() -> Unit)?,
) {
    var url by rememberSaveable(state.apiUrl) { mutableStateOf(state.apiUrl) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
    ) {
        Text(
            text = "Google Sheets 网关",
            style = androidx.compose.material3.MaterialTheme.typography.headlineMedium,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "粘贴已部署的 Apps Script Web App URL。Android App 透过此网关读写 Google Sheet，不会把服务账号密钥放进 APK。",
            color = InkSoft,
            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
        )
        Spacer(Modifier.height(20.dp))
        OutlinedTextField(
            value = url,
            onValueChange = { url = it },
            label = { Text("Apps Script URL") },
            placeholder = { Text("https://script.google.com/macros/s/…/exec") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = { onSave(url) },
            modifier = Modifier.fillMaxWidth(),
            enabled = url.startsWith("https://"),
        ) {
            Text("保存")
        }
        if (onBack != null) {
            Spacer(Modifier.height(8.dp))
            OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
                Text("返回登录")
            }
        }
        if (!state.message.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(text = state.message, color = Muted)
        }
    }
}
