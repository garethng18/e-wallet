package com.ewallet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.ewallet.app.ui.WalletUiState
import com.ewallet.app.ui.theme.Brand
import com.ewallet.app.ui.theme.Ink
import com.ewallet.app.ui.theme.InkSoft
import com.ewallet.app.ui.theme.Muted
import com.ewallet.app.ui.theme.Surface

@Composable
fun LoginScreen(
    state: WalletUiState,
    onLogin: (String, String) -> Unit,
    onOpenSettings: () -> Unit,
) {
    var username by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 40.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Column {
            Text(text = "E Wallet", color = Brand, style = androidx.compose.material3.MaterialTheme.typography.displayLarge)
            Spacer(Modifier.height(12.dp))
            Text(
                text = "Fun享健康 · 好生活",
                color = Ink,
                style = androidx.compose.material3.MaterialTheme.typography.headlineMedium,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Android 电子钱包，参考 AIA友Point。资料保存在 Google Sheet。",
                color = InkSoft,
                style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
            )
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(Surface)
                .padding(20.dp),
        ) {
            if (!state.configured) {
                Text(
                    text = "先到设置粘贴 Google Apps Script 网关网址，才能登录。",
                    color = Muted,
                    style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
                )
                Spacer(Modifier.height(12.dp))
                OutlinedButton(onClick = onOpenSettings, modifier = Modifier.fillMaxWidth()) {
                    Text("打开设置")
                }
            } else {
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("用户名") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("密码") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                )
                if (!state.error.isNullOrBlank()) {
                    Spacer(Modifier.height(10.dp))
                    Text(text = state.error, color = Brand)
                }
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = { onLogin(username, password) },
                    enabled = !state.loading && username.isNotBlank() && password.isNotBlank(),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(if (state.loading) "登录中…" else "登录 E Wallet")
                }
                Spacer(Modifier.height(8.dp))
                OutlinedButton(onClick = onOpenSettings, modifier = Modifier.fillMaxWidth()) {
                    Text("设置 Sheets 网关")
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = "密码不会写在 App 里，只存在 Google Sheet（hash）。",
                color = Muted,
                style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
            )
        }
    }
}
