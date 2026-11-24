package com.ewallet.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.ewallet.app.ui.EWalletNav
import com.ewallet.app.ui.WalletViewModel
import com.ewallet.app.ui.theme.EWalletTheme
import com.ewallet.app.ui.theme.Canvas

class MainActivity : ComponentActivity() {
    private val viewModel: WalletViewModel by viewModels {
        WalletViewModel.Factory((application as EWalletApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EWalletTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = Canvas) {
                    EWalletNav(viewModel = viewModel)
                }
            }
        }
    }
}
