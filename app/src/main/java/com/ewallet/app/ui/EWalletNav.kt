package com.ewallet.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardGiftcard
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.ListAlt
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.ewallet.app.ui.screens.EarnScreen
import com.ewallet.app.ui.screens.HistoryScreen
import com.ewallet.app.ui.screens.LoginScreen
import com.ewallet.app.ui.screens.SettingsScreen
import com.ewallet.app.ui.screens.TransferScreen
import com.ewallet.app.ui.screens.WalletScreen
import com.ewallet.app.ui.theme.Brand

private data class Tab(val route: String, val label: String, val icon: ImageVector)

@Composable
fun EWalletNav(viewModel: WalletViewModel) {
    val state by viewModel.state.collectAsState()
    val navController = rememberNavController()

    if (state.bootstrapping) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Brand)
        }
        return
    }

    if (!state.loggedIn) {
        NavHost(navController = navController, startDestination = "login") {
            composable("login") {
                LoginScreen(
                    state = state,
                    onLogin = viewModel::login,
                    onOpenSettings = { navController.navigate("settings") },
                )
            }
            composable("settings") {
                SettingsScreen(
                    state = state,
                    onSave = viewModel::saveApiUrl,
                    onBack = { navController.popBackStack() },
                )
            }
        }
        return
    }

    val tabs = listOf(
        Tab("wallet", "钱包", Icons.Outlined.Home),
        Tab("earn", "赚取", Icons.Outlined.CardGiftcard),
        Tab("transfer", "转赠", Icons.Outlined.Send),
        Tab("history", "记录", Icons.Outlined.ListAlt),
        Tab("settings", "设置", Icons.Outlined.Settings),
    )

    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination?.route ?: "wallet"

    Scaffold(
        bottomBar = {
            NavigationBar {
                tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = current == tab.route,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo("wallet") { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = "wallet",
            modifier = Modifier.padding(padding),
        ) {
            composable("wallet") {
                WalletScreen(
                    state = state,
                    onLogout = viewModel::logout,
                    onRefresh = viewModel::refreshMe,
                )
            }
            composable("earn") {
                EarnScreen(
                    state = state,
                    onEarn = viewModel::earn,
                    onRedeem = viewModel::redeem,
                    onClearFlash = viewModel::clearFlash,
                )
            }
            composable("transfer") {
                TransferScreen(
                    state = state,
                    onTransfer = viewModel::transfer,
                    onRefreshDirectory = viewModel::refreshDirectory,
                    onClearFlash = viewModel::clearFlash,
                )
            }
            composable("history") {
                HistoryScreen(
                    state = state,
                    onRefresh = viewModel::refreshTransactions,
                )
            }
            composable("settings") {
                SettingsScreen(
                    state = state,
                    onSave = viewModel::saveApiUrl,
                    onBack = null,
                )
            }
        }
    }
}
