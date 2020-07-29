import React, { useState, useEffect } from "react";
import Quote from "../../Quote/Quote";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "../../Modal/Modal";
import Spinner from "../../Spinner/Spinner";
import styles from "../Buy/Buy.module.css";
import axios from "axios";
import Footer from "../../Footer/Footer";

const Buy = (props) => {
  const [myData, setMyData] = useState([]);
  const [company, setCompany] = useState("");
  const [shares, setShares] = useState("");
  const [money, setMoney] = useState([]);
  const [displayMoney, setDisplayMoney] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [modal, setModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");
  let day = new Date().getDate();
  let month = new Date().getMonth();
  let year = new Date().getFullYear();
  let fullDate = `${day}/${month + 1}/${year}`;

  useEffect(() => {
    let fireData = [];
    axios
      .get(
        `https://wallstreet-bull.firebaseio.com/orders.json?auth=${props.token}`
      )
      .then((response) => {
        for (let key in response.data) {
          fireData.push([...response.data[key]]);
        }
        if (response.data !== null) {
          fireData = fireData.splice(-1).pop();
          setMyData(...myData, fireData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    let myMoney = [];
    axios
      .get(
        `https://wallstreet-bull.firebaseio.com/money.json?auth=${props.token}`
      )
      .then((response) => {
        for (let key in response.data) {
          myMoney.push([...response.data[key]]);
        }
        if (response.data !== null) {
          myMoney = myMoney.splice(-1).pop();
          setMoney(...money, myMoney);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
    let myHistory = [];
    axios
      .get(
        `https://wallstreet-bull.firebaseio.com/history.json?auth=${props.token}`
      )
      .then((response) => {
        for (let key in response.data) {
          myHistory.push(response.data[key]);
        }
        if (response.data !== null) {
          myHistory = myHistory.splice(-1).pop();
          setHistory(...history, myHistory);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = (e) => {
    e.preventDefault();
    const API = `https://cloud.iexapis.com/stable/stock/${company}/quote?token=pk_583772a9158d43bd9e8f55df5c33a5b3`;
    axios
      .get(API)
      .then((response) => {
        console.log(response);
        let calc = displayMoney - shares * response.data.latestPrice;
        let myMoney = {
          money: calc,
          userId: props.userId,
        };
        setMoney([...money, myMoney]);
        const resData = {
          shares: parseInt(shares),
          symbol: company.toUpperCase(),
          companyName: response.data.companyName,
          price: response.data.latestPrice,
          buyOrSell: false,
          date: fullDate,
          userId: props.userId,
        };
        setSuccess("Success!");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setHistory([...history, resData]);
        hideModal();
        for (const item of myData) {
          if (item.symbol === resData.symbol && item.userId === props.userId) {
            item.shares += +shares;
            axios
              .post(
                `https://wallstreet-bull.firebaseio.com/orders.json?auth=${props.token}`,
                myData
              )
              .then((response) => {
                console.log(response);
              })
              .catch((err) => {
                console.log(err);
              });
            setCompany("");
            setShares("");
            return;
          }
        }
        setMyData([...myData, resData]);
        setCompany("");
        setShares("");
      })
      .catch((err) => {
        hideModal();
        console.log(err);
        setErrorMessage(err.response.data);
      });
  };

  useEffect(() => {
    let updatedMoney;
    for (const item of money) {
      if (item.userId === props.userId) {
        updatedMoney = item.money;
      }
    }
    if (updatedMoney !== undefined) {
      setDisplayMoney(updatedMoney);
    }
    if (company !== "") {
      axios
        .post(
          `https://wallstreet-bull.firebaseio.com/money.json?auth=${props.token}`,
          money
        )
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [money]);

  useEffect(() => {
    if (company !== "") {
      axios
        .post(
          `https://wallstreet-bull.firebaseio.com/history.json?auth=${props.token}`,
          history
        )
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    if (company !== "") {
      axios
        .post(
          `https://wallstreet-bull.firebaseio.com/orders.json?auth=${props.token}`,
          myData
        )
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myData]);

  const modalHandler = (e) => {
    e.preventDefault();
    setModal(true);
  };

  const hideModal = () => {
    setModal(false);
    setErrorMessage("");
  };

  return (
    <div>
      <div className={styles.Money}>
        <h4>My Money</h4>
        {loading ? <Spinner /> : <h1>${displayMoney.toFixed(2)}</h1>}
      </div>
      <hr />
      <div className={styles.Flex}>
        <div className={styles.Child}>
          <form onSubmit={modalHandler}>
            <h2>Buy Shares</h2>
            <p className={styles.Info}>
              Buy shares of companies and sell them later on higher price
            </p>
            <input
              type="text"
              placeholder="Company Symbol"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <p className={styles.InfoP}>
              Symbol like: "aapl", "msft", "fb", etc...
            </p>
            <input
              type="number"
              placeholder="Shares to Buy"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              required
            />
            <p className={styles.InfoP}>How many shares you want to buy?</p>
            <button className="btn btn-success btn-lg btn-block">BUY</button>
            <Modal status={modal} clicked={hideModal}>
              <h4>
                Are you sure you want to buy {shares} shares of {company}?
              </h4>
              <button
                className="btn btn-warning"
                type="button"
                onClick={hideModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                type="submit"
                onClick={fetchData}
              >
                Buy
              </button>
            </Modal>
          </form>
          {success !== "" ? (
            <h6 className="alert alert-warning">{success}</h6>
          ) : null}
          {errorMessage !== "" ? (
            <Modal status={!modal} clicked={hideModal}>
              {errorMessage}
            </Modal>
          ) : null}
        </div>
        <div className={styles.Child}>
          <Quote status={modal} clicked={modalHandler} />
        </div>
      </div>
      <h2 className={styles.List}>
        Have a look the full list of{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://eoddata.com/symbols.aspx"
        >
          NASDAQ SYMBOLS
        </a>{" "}
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://eoddata.com/stocklist/NYSE/A.htm?e=NYSE&l=A"
        >
          NEW YORK STOCK EXCHANGE SYMBOLS
        </a>{" "}
        or others.
      </h2>
      <Footer />
    </div>
  );
};

export default Buy;
