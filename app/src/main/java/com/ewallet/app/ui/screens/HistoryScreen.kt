package com.ewallet.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.ewallet.app.ui.WalletUiState
import com.ewallet.app.ui.theme.Brand
import com.ewallet.app.ui.theme.InkSoft
import com.ewallet.app.ui.theme.Muted
import java.text.NumberFormat
import java.util.Locale

@Composable
fun HistoryScreen(
    state: WalletUiState,
    onRefresh: () -> Unit,
) {
    LaunchedEffect(Unit) { onRefresh() }
    val userId = state.user?.userId

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
    ) {
        Text(text = "积分记录", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text(
            text = "查看已赚取、兑换与转赠的交易明细。",
            color = InkSoft,
            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
        )
        TextButton(onClick = onRefresh) { Text("刷新", color = Brand) }

        if (state.transactions.isEmpty()) {
            Text(text = "暂无交易记录", color = Muted)
        }

        LazyColumn {
            items(state.transactions, key = { it.txnId }) { txn ->
                val incoming = txn.toUserId == userId
                val signed = when {
                    txn.type == "earn" -> txn.amount
                    txn.type == "transfer" && incoming -> txn.amount
                    else -> -txn.amount
                }
                val typeLabel = when (txn.type) {
                    "earn" -> "赚取"
                    "redeem" -> "兑换"
                    else -> "转赠"
                }
                Spacer(Modifier.height(8.dp))
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(typeLabel, style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
                            Text(txn.note, color = Muted)
                            Text("${txn.createdAt} · ${txn.txnId}", color = Muted)
                        }
                        Text(
                            text = (if (signed >= 0) "+" else "") +
                                NumberFormat.getIntegerInstance(Locale.TRADITIONAL_CHINESE).format(signed),
                            color = if (signed >= 0) Color(0xFF047857) else Brand,
                        )
                    }
                }
            }
        }
    }
}
