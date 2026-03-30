const fetchStockData(symbol) = async () => {
  try {
    res = await fetch("https://yfapi.net/v8/finance/chart/${symbol}", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }
};

function searchStocks(query) {
  fetchStockData(query.trim());
}

console.log(searchStocks('SSABH.HE'));
