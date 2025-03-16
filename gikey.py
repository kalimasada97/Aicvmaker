import ccxt
import itertools
import time

# Konfigurasi Binance API
exchange = ccxt.binance({
    'apiKey': 'K4imTSPtLipPhOEQP1BXKCSmshiEldyMhZtHxxP4fGqEHsSeskglltZqE9DGE44g',
    'secret': 'DFWScLQ83OpMCqmtj6pJrs2Z36OdMXzNWudwVimbRR9AJL46X3yHynG7t6traHr',
    'enableRateLimit': True,
})

# Parameter
min_profit_percent = 0.3  # Minimal profit setelah biaya (0.3%)
max_pairs_to_scan = 50    # Batasi jumlah pair untuk hindari rate limit

def fetch_usdt_pairs():
    """Ambil semua pair USDT spot dengan likuiditas tinggi"""
    markets = exchange.load_markets()
    usdt_pairs = [symbol for symbol in markets if markets[symbol]['quote'] == 'USDT' 
                  and markets[symbol]['spot'] 
                  and markets[symbol]['active']]
    return usdt_pairs[:max_pairs_to_scan]  # Batasi jumlah pair

def calculate_triangular_profit(base, intermediate, quote):
    """Hitung profit triangular: USDT → Base → Intermediate → USDT"""
    try:
        # Step 1: USDT → Base (e.g., BUY ETH/USDT)
        ticker1 = exchange.fetch_ticker(f"{base}/USDT")
        buy_price = ticker1['ask']  # Harga beli termurah
        
        # Step 2: Base → Intermediate (e.g., SELL ETH/BTC)
        ticker2 = exchange.fetch_ticker(f"{intermediate}/{base}")
        sell_price = ticker2['bid']  # Harga jual tertinggi
        
        # Step 3: Intermediate → USDT (e.g., SELL BTC/USDT)
        ticker3 = exchange.fetch_ticker(f"{intermediate}/USDT")
        final_price = ticker3['bid']  # Harga jual tertinggi
        
        # Simulasi perhitungan profit
        initial_usdt = 100  # Asumsi 100 USDT untuk memudahkan
        amount_base = initial_usdt / buy_price
        amount_intermediate = amount_base * sell_price
        final_usdt = amount_intermediate * final_price
        
        # Kurangi biaya transaksi (0.1% per trade, total 0.3%)
        fee = initial_usdt * 0.003
        profit = final_usdt - initial_usdt - fee
        profit_percent = (profit / initial_usdt) * 100
        
        return profit_percent
    
    except:
        return None

def scan_triangular_opportunities():
    usdt_pairs = fetch_usdt_pairs()
    base_currencies = list(set([pair.split('/')[0] for pair in usdt_pairs))
    
    print(f"Memindai {len(base_currencies)} aset USDT...")
    
    # Generate semua kombinasi triangular yang mungkin
    for base, intermediate in itertools.permutations(base_currencies, 2):
        profit_percent = calculate_triangular_profit(base, intermediate, 'USDT')
        
        if profit_percent and profit_percent > min_profit_percent:
            print(f"🚀 Peluang: USDT → {base} → {intermediate} → USDT | Profit: {profit_percent:.2f}%")
        
        time.sleep(0.1)  # Hindari rate limit

# Jalankan scanner
while True:
    scan_triangular_opportunities()
    time.sleep(60)  # Scan ulang setiap 60 detik