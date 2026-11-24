package com.ewallet.app

import android.app.Application
import com.ewallet.app.data.SessionStore
import com.ewallet.app.data.SheetsApiClient
import com.ewallet.app.data.WalletRepository

class EWalletApp : Application() {
    lateinit var repository: WalletRepository
        private set

    override fun onCreate() {
        super.onCreate()
        val sessionStore = SessionStore(this)
        val api = SheetsApiClient(sessionStore)
        repository = WalletRepository(api, sessionStore)
    }
}
