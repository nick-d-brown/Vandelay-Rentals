import React, { Component, Fragment } from 'react';
import ReactTable from 'react-table';
import Modal from '../../components/Elements/Modal';
import LoadingModal from '../../components/Elements/LoadingModal';
import API from '../../utils/API';
import 'react-table/react-table.css';
import './AdminTables.css';
import checkboxHOC from 'react-table/lib/hoc/selectTable';
import dateFns from 'date-fns';
const CheckboxTable = checkboxHOC(ReactTable);

export class PastRentalsTable extends Component {
  state = {
    modal: {
      isOpen: false,
      header: '',
      body: '',
      footer: ''
    },
    runUnmount: false,
    pastRentals: this.props.pastRentals,
    selection: [],
    selectedRow: {}
  };

  componentWillUnmount = () => {
    //  Why call get users on Unmount?
    //  Clicking cancelReservation runs all the necessary database functions to delete the reservation, but in this component it only filters it from the this.state.reservations array, meaning if you close the table and reopen it, the one you just deleted will still show. So by running the get user function when the component unmounts ensures this won't happen while also avoiding an extra database query with every deletion.
    if (this.state.runUnmount) {
      this.props.adminGetAllRentals();
    }
  };

  // MODAL TOGGLE FUNCTIONS
  toggleModal = () => {
    this.setState({
      modal: { isOpen: !this.state.modal.isOpen }
    });
  };

  //  isOpen MUST be set to true for the setModal function, and NOT '!this.state.modal.isOpen' as in the toggleModal function, otherwise select/option tags (dropdowns) won't work properly inside the modal: the dropdown is always a step behind populating from state (the selection won't display what you've chosen until you close and reopen the modal).
  setModal = modalInput => {
    this.setState({
      modal: {
        isOpen: true,
        header: modalInput.header,
        body: modalInput.body,
        footer: modalInput.footer
      }
    });
  };
  // END MODAL TOGGLE FUNCTIONS

  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  };

  //  REACT-TABLE: SELECT TABLE HOC FUNCTIONS
  //  This toggles the selected (highlighted) row on or off by pushing/slicing it to/from the this.state.selection array
  toggleSelection = (key, shift, row) => {
    let selection = [...this.state.selection];
    const keyIndex = selection.indexOf(key);

    if (keyIndex >= 0) {
      // it does exist so we will remove it
      selection = [
        ...selection.slice(0, keyIndex),
        ...selection.slice(keyIndex + 1)
      ];
    } else {
      // it does not exist so add it
      selection = [];
      selection.push(key);
    }

    //  set state with the selected row key, but also set selectedRow with the entire row object, making it available for db updates
    this.setState({ selection, selectedRow: row });
  };

  // Inside the render function, isSelected returns a true or false depending on if a row is selected
  isSelected = key => {
    return this.state.selection.includes(key);
  };

  //  logs the selected row and the selection array to the console
  logSelection = () => {
    console.log('Selection:', this.state.selection);
    console.log('Row: ', this.state.selectedRow);
  };
  //  END REACT-TABLE: SELECT TABLE HOC FUNCTIONS

  render() {
    //  destructure from 'this' because the props object doesn't like 'this.anything' unless it's in a key:value pair
    const { toggleSelection, isSelected } = this;
    // console.log(this.state.reservations);

    if (this.state.pastRentals.length > 0) {
      this.state.pastRentals.map(pastRental => {
        pastRental.date.formattedTo = dateFns.format(
          pastRental.date.to * 1000,
          'MMM Do YYYY'
        );
        pastRental.date.formattedFrom = dateFns.format(
          pastRental.date.from * 1000,
          'MMM Do YYYY'
        );
        const bill =
          ((parseInt(pastRental.date.to) - parseInt(pastRental.date.from)) /
            86400 +
            1) *
          pastRental.dailyRate.$numberDecimal;
        pastRental.amountPaid = '$' + parseFloat(bill).toFixed(2);
      });
    }

    const checkboxProps = {
      isSelected,
      toggleSelection,
      selectType: 'checkbox',
      getTrProps: (s, r) => {
        // If there are any empty rows ('r'), r.orignal will throw an error ('r' is undefined), so check for r:
        let selected;
        if (r) {
          selected = this.isSelected(r.original._id);
        }
        return {
          style: {
            backgroundColor: selected ? 'yellow' : 'inherit',
            color: selected ? '#000' : 'inherit'
          }
        };
      }
    };

    return (
      <Fragment>
        <Modal
          show={this.state.modal.isOpen}
          toggleModal={this.toggleModal}
          header={this.state.modal.header}
          body={this.state.modal.body}
          footer={this.state.modal.footer}
        />
        <LoadingModal show={this.state.loadingModalOpen} />

        <h3>Past Rentals for {this.props.forName}</h3>

        {/* if no rows have been selected, button remains disabled;
      otherwise, clicking the button without anything selected results in an error */}

        <div className="table-btn-div">
          <h4>Past Rentals Table Options</h4>
          {/* <button disabled={this.state.selection.length === 0} onClick={this.toggleReservationPaid}>Record Payment</button>
          <button disabled={this.state.selection.length === 0} onClick={this.recordRentalInUse}>Record Checkout</button>
          <button disabled={this.state.selection.length === 0} onClick={this.recordRentalReturn}>Record Turn-in</button>
          <button disabled={this.state.selection.length === 0} onClick={this.cancelReservation}>Cancel Reservation</button> */}
          <button
            disabled={this.state.selection.length === 0}
            onClick={this.logSelection}
          >
            Log Selection
          </button>
        </div>
        <CheckboxTable
          // this ref prop is the 'r' that gets passed in to 'getTrProps' in the checkboxprops object
          ref={r => (this.checkboxTable = r)}
          data={this.state.pastRentals}
          columns={[
            {
              Header: 'Customer',
              columns: [
                {
                  Header: 'First Name',
                  accessor: 'firstName'
                },
                {
                  Header: 'Last Name',
                  accessor: 'lastName'
                }
              ]
            },
            {
              Header: 'Reservation Data',
              columns: [
                {
                  Header: 'Item Name',
                  accessor: 'itemName'
                },
                {
                  Header: 'Date From',
                  accessor: 'date.formattedFrom'
                },
                {
                  Header: 'Date To',
                  accessor: 'date.formattedTo'
                },
                {
                  Header: 'Amount Paid',
                  accessor: 'amountPaid'
                }
              ]
            }
          ]}
          defaultPageSize={5}
          className="-striped -highlight sub-table"
          {...checkboxProps}
        />
      </Fragment>
    );
  }
}