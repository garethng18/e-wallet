package com.ewallet.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ewallet.app.ui.WalletUiState
import com.ewallet.app.ui.theme.Brand
import com.ewallet.app.ui.theme.InkSoft
import java.text.NumberFormat
import java.util.Locale

private data class Task(val id: String, val title: String, val desc: String, val amount: Int)
private data class Reward(val id: String, val title: String, val amount: Int)

@Composable
fun EarnScreen(
    state: WalletUiState,
    onEarn: (String) -> Unit,
    onRedeem: (String) -> Unit,
    onClearFlash: () -> Unit,
) {
    LaunchedEffect(state.message, state.error) {
        if (!state.message.isNullOrBlank() || !state.error.isNullOrBlank()) {
            kotlinx.coroutines.delay(2500)
            onClearFlash()
        }
    }

    val tasks = listOf(
        Task("walk", "步行一万步", "完成今日步行目标", 120),
        Task("checkup", "年度体检打卡", "上传体检完成证明", 300),
        Task("quiz", "健康知识小测验", "答对指定题目即可", 80),
    )
    val rewards = listOf(
        Reward("coffee", "咖啡礼券", 200),
        Reward("voucher", "超市礼券", 500),
        Reward("wellness", "健康体验礼遇", 800),
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text(text = "奖励中心", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text(
            text = "参考 AIA友Point：做任务赚取，兑换奖励。每日赚取有上限。",
            color = InkSoft,
            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "目前余额 ${NumberFormat.getIntegerInstance(Locale.TRADITIONAL_CHINESE).format(state.user?.balance ?: 0)}",
            color = Brand,
        )
        if (!state.message.isNullOrBlank()) Text(text = state.message, color = Brand)
        if (!state.error.isNullOrBlank()) Text(text = state.error!!, color = Brand)

        Spacer(Modifier.height(16.dp))
        Text(text = "赚取积分", style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
        tasks.forEach { task ->
            Spacer(Modifier.height(10.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(task.title, style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
                        Text(task.desc, color = InkSoft)
                        Text("+${task.amount}", color = Brand)
                    }
                    Button(
                        onClick = { onEarn(task.id) },
                        enabled = !state.loading,
                    ) { Text("开始") }
                }
            }
        }

        Spacer(Modifier.height(20.dp))
        Text(text = "兑换奖励", style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
        rewards.forEach { reward ->
            Spacer(Modifier.height(10.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        Text(reward.title, style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
                        Text("${reward.amount} 积分", color = InkSoft)
                    }
                    OutlinedButton(
                        onClick = { onRedeem(reward.id) },
                        enabled = !state.loading,
                    ) { Text("兑换") }
                }
            }
        }
    }
}
