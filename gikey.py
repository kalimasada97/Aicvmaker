import ccxt
import itertools
import time
import os
from dotenv import load_dotenv
load_dotenv()  # Load variables from .env

exchange = ccxt.binance({
    'apiKey': os.getenv('BINANCE_API_KEY'),
    'secret': os.getenv('BINANCE_SECRET_KEY'),
    #...
})
# Konfigurasi Binance API (AMANKAN API KEY!)
exchange = ccxt.binance({
    'apiKey': os.getenv('BINANCE_API_KEY'),  # Gunakan environment variable
    'secret': os.getenv('BINANCE_SECRET_KEY'),
    'enableRateLimit': True,
    'options': {'adjustForTimeDifference': True}
})

# Parameter Alert
MIN_PROFIT = 0.5  # Minimal profit 0.5%
REFRESH_INTERVAL = 60  # Detik

def fetch_liquid_pairs():
    """Ambil pair USDT dengan likuiditas tinggi"""
    markets = exchange.load_markets()
    return [
        symbol for symbol in markets
        if (markets[symbol]['quote'] == 'USDT' 
            and markets[symbol]['spot'] 
            and markets[symbol]['quoteVolume'] > 1_000_000)  # Volume > 1jt USDT
    ][:50]  # Ambil top 50

def check_triangular_arb(base, intermediate):
    """Deteksi peluang arbitrase triangular"""
    try:
        # Step 1: USDT → Base
        ticker1 = exchange.fetch_ticker(f"{base}/USDT")
        buy_price = ticker1['ask']
        
        # Step 2: Base → Intermediate
        ticker2 = exchange.fetch_ticker(f"{intermediate}/{base}")
        sell_price = ticker2['bid']
        
        # Step 3: Intermediate → USDT
        ticker3 = exchange.fetch_ticker(f"{intermediate}/USDT")
        final_price = ticker3['bid']
        
        # Simulasi profit
        initial = 100  # Asumsi 100 USDT
        profit = (initial / buy_price * sell_price * final_price) - initial
        profit_percent = (profit / initial) * 100
        
        return profit_percent
    
    except Exception as e:
        print(f"Error checking {base}-{intermediate}: {str(e)}")
        return None

def alert_system(profit, base, intermediate):
    """Sistem notifikasi sederhana"""
    if profit > MIN_PROFIT:
        print(f"""
        🚨 ARBITRAGE ALERT 🚨
        Path: USDT → {base} → {intermediate} → USDT
        Estimated Profit: {profit:.2f}%
        """)
        # Tambahkan logika notifikasi lain (email/telegram) di sini

def main():
    print("🔥 Arbitrage Alert System Activated 🔥")
    print(f"Minimum Profit Threshold: {MIN_PROFIT}%")
    
    while True:
        pairs = fetch_liquid_pairs()
        currencies = list(set([p.split('/')[0] for p in pairs))
        
        for base, intermediate in itertools.permutations(currencies, 2):
            profit = check_triangular_arb(base, intermediate)
            if profit and profit > MIN_PROFIT:
                alert_system(profit, base, intermediate)
            
            time.sleep(0.5)  # Jaga rate limit
        
        print(f"\n🔄 Scan completed. Refreshing in {REFRESH_INTERVAL}s...")
        time.sleep(REFRESH_INTERVAL)

if __name__ == "__main__":
    main()