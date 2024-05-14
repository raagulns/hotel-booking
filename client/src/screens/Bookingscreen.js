import React, { useState, useEffect } from "react";
import axios from 'axios';
import moment from "moment";
import StripeCheckout from "react-stripe-checkout";
import Swal from "sweetalert2";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { v4 as uuidv4 } from 'uuid';
function Bookingscreen({ match }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [room, setRoom] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  const roomid = match.params.roomid;
  const fromdate = moment(match.params.fromdate, "DD-MM-YYYY");
  const todate = moment(match.params.todate, "DD-MM-YYYY");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      window.location.href = "/login";
    }
    async function fetchMyAPI() {
      try {
        setError("");
        setLoading(true);
        const data = (
          await axios.post("https://hotel-manis-lodge.onrender.com/api/rooms/getroombyid", {
            roomid: match.params.roomid,
          })
        ).data;
        setRoom(data);
      } catch (error) {
        console.log(error);
        setError(error);
      }
      setLoading(false);
    }

    fetchMyAPI();
  }, []);

  useEffect(() => {
    const totaldays = moment.duration(todate.diff(fromdate)).asDays() + 1;
    setTotalDays(totaldays);
    setTotalAmount(totaldays * room.rentperday);
  }, [room, fromdate, todate]);

  const pay = async () => {
    try {
      const bookingDetails = {
        roomid: roomid,
        userid: JSON.parse(localStorage.getItem("currentUser"))._id,
        fromdate: fromdate.format("DD-MM-YYYY"),
        todate: todate.format("DD-MM-YYYY"),
        totalamount: totalAmount,
        totaldays: totalDays,
        room:room.name,
        transactionid: uuidv4(),
      };
      console.log(bookingDetails);
      const response = await axios.post("https://hotel-manis-lodge.onrender.com/api/bookings/bookroom", bookingDetails);
      Swal.fire(
        "Congratulations",
        "Your Room Booked Successfully",
        "success"
      ).then(() => {
        window.location.href = "/home";
      });
    } catch (error) {
      Swal.fire("Oops", "An error occurred while booking the room", "error");
      console.error(error);
    }
  };   

  return (
    <div className="m-5">
      {loading ? (
        <Loader></Loader>
      ) : error.length > 0 ? (
        <Error msg={error}></Error>
      ) : (
        <div className="row justify-content-center mt-5 bs">
          <div className="col-md-6">
            <h1>{room.name}</h1>
            <img src={room.imageurls[0]} alt="" className="bigimg" />
          </div>
          <div className="col-md-6">
            <div style={{ textAlign: "right" }}>
              <h1>Booking Details</h1>
              <hr />
              <b>
                <p>
                  Name : {JSON.parse(localStorage.getItem("currentUser")).name}
                </p>
                <p>From Date : {fromdate.format("DD-MM-YYYY")}</p>
                <p>To Date : {todate.format("DD-MM-YYYY")}</p>
                <p>Max Count : {room.maxcount}</p>
              </b>
            </div>
            <div style={{ textAlign: "right" }}>
              <h1>Amount</h1>
              <hr />
              <b>
                <p>Total Days : {totalDays}</p>
                <p>Rent per day : {room.rentperday}</p>
                <p>Total Amount : {totalAmount}</p>
              </b>
            </div>
            <button onClick={pay}>Pay Now</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookingscreen;
