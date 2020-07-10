import React, { useState, useEffect } from "react";
import axios from "axios";

const Buy = () => {
  const [myData, setMyData] = useState([]);
  const [company, setCompany] = useState("");
  const [shares, setShares] = useState("");
  const [money, setMoney] = useState(5000);

  const fetchData = (e) => {
    e.preventDefault();
    const API = `https://cloud.iexapis.com/stable/stock/${company}/quote?token=pk_583772a9158d43bd9e8f55df5c33a5b3`;
    axios
      .get(API)
      .then((response) => {
        const resData = {
          shares: parseInt(shares),
          symbol: company.toLocaleUpperCase(),
          companyName: response.data.companyName,
          price: response.data.latestPrice,
        };
        for (const item of myData) {
          if (item.symbol === resData.symbol) {
            setMoney(money - resData.shares * resData.price);
            item.shares += +shares;
            if (response) {
              console.log("Response");
              axios
                .post(
                  "https://wallstreet-bull.firebaseio.com/orders.json",
                  myData
                )
                .then((response) => {
                  console.log(response);
                })
                .catch((err) => {
                  console.log(err);
                });
            }
            setCompany("");
            setShares("");
            return;
          }
        }
        setMoney(money - resData.shares * resData.price);
        setMyData([...myData, resData]);
        setCompany("");
        setShares("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    console.log(myData);
    axios
      .post("https://wallstreet-bull.firebaseio.com/orders.json", myData)
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [myData]);

  return (
    <div>
      <h1>Your money {money}</h1>
      <hr />
      <h3>Buy Stock</h3>
      <form onSubmit={fetchData}>
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          type="number"
          placeholder="Shares"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
        />
        <button>BUY</button>
      </form>
    </div>
  );
};

export default Buy;
