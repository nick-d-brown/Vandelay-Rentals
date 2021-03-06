import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Header from "../../components/Elements/Header";
import API from "../../utils/API";
import Calendar from "../../components/Calendar";
import DevLinks from "../../components/DevLinks.js";
import NavBar from "../../components/Elements/NavBar";
// import Calendar2 from "react-calendar";
import "./../../App.css";
import "./testBen.css";
import RentalCard from "../../components/Cards/RentalCard";
import DevMenu from "../../components/Elements/DevMenu/DevMenu";
import { Elements, StripeProvider } from 'react-stripe-elements';
import CheckoutForm from '../../components/Stripe/CheckoutForm';

// let date = new Date();
// let dateWrapper = moment(date);

class Test extends Component {

  state = {
    rentals: [],
    unix: [],
    // from: null,
    // to: null,
    // enteredTo: null,
    unavailable: []
  };

  componentDidMount() {
    this.getAllRentals();
  }

  getAllRentals = () => {
    API.getAllRentals()
      .then(res => {
        this.setState({
          rentals: res.data
        });
      })
      .catch(err => console.log(err));
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
  };

  onChange = date => {
    this.getDays(date);
  }

  getDays = date => { //date is the array that is passed from the calendar when days are selected.
    let temp = [];
    let range = [];
    date.map(dates => temp.push(Date.parse(dates) / 1000)); //stores first and last day in temporary array
    let days = Math.floor((temp[1] - temp[0]) / 86400); //seconds in day = 86400  Calculates total number of days for rental.
    range.push(temp[0]); //store first day in range array.
    for (let i = 0; i < days; i++) { //adds each day (including last) to range array
      range.push(range[i] + 86400);
    }
    this.setState({ unix: range, date: date }); //sets state
  }

  checkAvailability = itemRes => { //passed all the reservations for a given item
    for (let i = 0; i < itemRes.length; i++) { //iterate through all individual reservations to compare to selected dates one at a time
      let range = []; //holds each individual day of a reservation
      let days = (itemRes[i].date.to - itemRes[i].date.from) / 86400; //determines total number of days for each reservation
      range.push(itemRes[i].date.from); //pushes the first day of the reservation
      for (let j = 0; j < days; j++) {//
        range.push(range[j] + 86400); //adds all days of a reservation to range for comparison
      };                              //
      for (let k = 0; k < this.state.unix.length; k++) { //compares each index in this.state.unix to each index in range
        if (range.includes(this.state.unix[k])) { //
          return false;                           //returns false if range include the index value of this.state.unix
        }                                         //
      }
    }
    return true; //returns true if no matches are found
  }

  markUnavailable = itemRes => {
    let unavailable = [];
    for (let i = 0; i < itemRes.length; i++) { //iterate through all individual reservations to compare to selected dates one at a time
      let days = (itemRes[i].date.to - itemRes[i].date.from) / 86400; //determines total number of days for each reservation
      unavailable.push(itemRes[i].date.from); //pushes the first day of the reservation
      for (let j = 0; j < days; j++) {//
        unavailable.push(unavailable[j] + 86400); //adds all days of a reservation to range for comparison
      };                              //
    }
    this.setState({ unavailable: unavailable })
  }

  clearUnavailable = () => {
    this.setState({ unavailable: [] })
  }

  render() {
    return (
      <div className="main-container">
        <NavBar
          loggedIn={this.props.loggedIn}
          admin={this.props.admin}
          logout={this.props.logout}
          location={this.props.location}
          dev={this.props.dev}
        />
        <Header>
          <h1>BEN'S TEST PAGE</h1>
          <h2>A Page for Testing Components</h2>
          <h2>(CALENDAR STUFF)</h2>

          {/* Navigation */}
          <DevMenu
            loggedIn={this.props.loggedIn}
            admin={this.props.admin}
          />
          <DevLinks />
          <div className="nav-container">
            <Link className="btn-link" to="/" role="button">Home</Link>
            <Link className="btn-link" to="/rentals" role="button">Rentals</Link>
            <Link className="btn-link" to="/sales" role="button">Sales</Link>
            <Link className="btn-link" to="/courses" role="button">Courses</Link>
            {this.props.loggedIn ? (
              <button className="btn-link" onClick={this.props.logout}>logout</button>
            ) : (
                <React.Fragment>
                  <Link className="btn-link" to="/signup" role="button">Signup</Link>
                  <Link className="btn-link" to="/login" role="button">Login</Link>
                </React.Fragment>
              )}
            <Link className="btn-link" to="/test" role="button">Test</Link>
            <Link className="btn-link" to="/testnick" role="button">TestNick</Link>
            <Link className="btn-link" to="/testben" role="button">TestBen</Link>
            <Link className="btn-link" to="/testcorb" role="button">TestCorb</Link>
            {this.props.admin ? <Link className="btn-link" to="/admin" role="button">Admin</Link> : null}
          </div>
        </Header>
        {/* <Calendar2
          onChange={this.onChange}
          // value={this.state.date}
          calendarType={"US"}
          selectRange={true}
          returnValue={"range"}
          className={"calendar"}
        /> */}

        <StripeProvider apiKey="pk_test_RwSP4QeJgsTpThoHAR7VRKmR">
          <div className="example">
            <h1>React Stripe Elements Example</h1>
            <Elements>
              <CheckoutForm />
            </Elements>
          </div>
        </StripeProvider>
        <Calendar
          updateUnix={this.getDays}
          unavailable={this.state.unavailable}
          clearUnavailable={this.clearUnavailable}
        />
        {/* <div style={{ position: 'relative', top: 50 + 'px', left: 25 + 'px' }}>{this.state.unix.join(" ")}</div> */}
        <div className='rentals'>
          <h2>Rentals Available:</h2>
          {/* <ul> */}
          {this.state.rentals.map(rental => (
            <RentalCard
              unix={this.state.unix}
              key={rental._id}
              id={rental._id}
              name={rental.name}
              category={rental.category}
              maker={rental.maker}
              reservations={rental.reservations}
              setAvailability={this.checkAvailability(rental.reservations)}
              rate={parseFloat(rental.dailyRate.$numberDecimal).toFixed(2)}
              markUnavailable={this.markUnavailable}
            />
          ))}
          {/* </ul> */}
        </div>
      </div>
    );
  }
}

export default Test;
