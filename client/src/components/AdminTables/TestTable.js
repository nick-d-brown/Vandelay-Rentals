import React, { Component, Fragment } from "react";
import { Label } from "../Elements/Form";
import API from "../../utils/API";
import Modal from "../../components/Elements/Modal";
import LoadingModal from "../../components/Elements/LoadingModal";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./AdminTables.css";
import checkboxHOC from "react-table/lib/hoc/selectTable";
import { ReservationsTable } from './ReservationsTable';
import { RegistrationsTable } from './RegistrationsTable';

const CheckboxTable = checkboxHOC(ReactTable);

// export class UsersTable extends Component {
export class TestTable extends Component {
  constructor() {
    super();
    this.state = {
      modal: {
        isOpen: false,
        header: "",
        body: "",
        footer: "",
        buttons: ""
      },
      password: "",
      confirmPassword: "",
      standing: "",
      users: [],
      selection: [],
      selectedRow: {}
    };
  }

  componentDidMount() {
    this.adminGetAllUsers();
  }

  toggleModal = () => {
    this.setState({
      modal: { isOpen: !this.state.modal.isOpen }
    });
  }

  setModal = (modalInput) => {
    this.setState({
      modal: {
        isOpen: true,
        header: modalInput.header,
        body: modalInput.body,
        footer: modalInput.footer,
        buttons: modalInput.buttons
      }
    });
  }

  //  Toggles a non-dismissable loading modal to prevent clicks while database ops are ongoing
  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  }

  // Standard input change controller
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  adminGetAllUsers = () => {
    API.adminGetAllUsers()
      .then(res => {
        console.log(res);
        this.setState({
          users: res.data,
          selection: [],
          selectedRow: {}
        });
        console.log(this.state.users);
      })
      .catch(err => console.log(err));
  };

  changePwModal = () => {
    this.setModal({
      body:
        <Fragment>
          <form>
            <h3>Change User Password</h3>
            <input
              name="password"
              onChange={this.handleInputChange}
              type="text"
            />
            <Label htmlFor="password">Password:</Label>
            <input
              name="confirmPassword"
              onChange={this.handleInputChange}
              type="text"
            />
            <Label htmlFor="confirmPassword">Confirm Password:</Label>
          </form>
        </Fragment>,
      buttons: <button onClick={this.handlePasswordFormSubmit}>Submit</button>
    })
  }

  handlePasswordFormSubmit = event => {
    console.log("Changing password...")
    const { _id } = this.state.selectedRow;
    event.preventDefault();
    API.adminUpdateUser(_id, { password: this.state.password })
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          this.setModal({
            body: <h4>Password successfully changed</h4>
          })
        } else {
          this.setModal({
            body:
              <Fragment>
                <h4>Something went wrong</h4>
                <h5>Please try again</h5>
              </Fragment>
          })
        }
      });
  }

  userStandingModal = () => {
    if (Object.keys(this.state.selectedRow).length !== 0) {
      this.setModal({
        body:
          <Fragment>
            <form>
              <h3>Change Customer Standing</h3>
              {/* using the Select and Option components in a modal seems to make everything stop working... */}
              <div className="group group-select">
                <select
                  name="standing"
                  // for some reason, setting the select value to this.state.category (as in the React docs) breaks the whole thing. It seems to be grabbing the value from the option html and putting that into state...
                  onChange={this.handleInputChange}
                >
                  <option></option>
                  <option>Good</option>
                  <option>Uncertain</option>
                  <option>Banned</option>
                </select>
              </div>
            </form>
          </Fragment>,
        buttons: <button onClick={this.handleStandingFormSubmit}>Submit</button>
      })
    }
  }

  handleStandingFormSubmit = e => {
    e.preventDefault();
    const { _id } = this.state.selectedRow;
    API.adminUpdateUser(_id, { standing: this.state.standing })
      .then(res => {
        this.adminGetAllUsers();
        this.toggleModal();
      });

  }

  //  REACT-TABLE: SELECT TABLE HOC FUNCTIONS

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

    this.setState({ selection, selectedRow: row });
  };

  isSelected = key => {
    return this.state.selection.includes(key);
  };

  updateSelectedRow = () => {
    const { city, email, firstName, lastName, phone, standing, state, street, username, zipcode, _id } = this.state.selectedRow;
    const updateObject = {
      city: city,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      standing: standing,
      state: state,
      street: street,
      username: username,
      zipcode: zipcode
    }
    console.log(updateObject);
    API.updateUser(_id, updateObject)
      .then(response => {
        console.log(response);
        this.adminGetAllUsers();
      })
  }

  logSelection = () => {
    console.log("Selection:", this.state.selection);
    console.log("Row: ", this.state.selectedRow);
  };

  renderEditable = cellInfo => {
    return (
      <div
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const users = [...this.state.users];
          users[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ users });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.users[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }

  render() {
    const { toggleSelection, isSelected } = this;

    const checkboxProps = {
      isSelected,
      toggleSelection,
      selectType: "checkbox",
      getTrProps: (s, r) => {
        let selected;
        if (r) {
          selected = this.isSelected(r.original._id);
        }
        return {
          style: {
            backgroundColor: selected ? "#00eef7" : "inherit",
            color: selected ? '#000' : 'inherit',
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
          buttons={this.state.modal.buttons}
        />
        <LoadingModal show={this.state.loadingModalOpen} />

        <div className="main-table-container">

          {/* <h2>All Users</h2> */}
          <h2>Test Users Table</h2>

          {/* <button onClick={this.props.toggleUsers}>Hide Table</button> */}
          <button onClick={this.props.toggleTest}>Hide Table</button>
          <button disabled={this.state.selection.length === 0} onClick={this.updateSelectedRow}>Update Selected Row</button>
          <button disabled={this.state.selection.length === 0} onClick={this.changePwModal}>Change Password</button>
          <button disabled={this.state.selection.length === 0} onClick={this.userStandingModal}>Change User Standing</button>
          <button disabled={this.state.selection.length === 0} onClick={this.logSelection}>Log Selection</button>

          <CheckboxTable
            ref={r => (this.checkboxTable = r)}
            data={this.state.users}
            filterable
            SubComponent={row => {
              console.log(row);
              //  thisReservation grabs the reservations from this.state.rentals that matches the row index - it grabs the reservations for this rental item.
              const thisRow = this.state.users[row.row._index];

              return (
                <Fragment>
                  {thisRow.reservations.length > 0 ? (
                    <ReservationsTable
                      forName={`${thisRow.firstName} ${thisRow.lastName}`}
                      reservations={thisRow.reservations}
                      adminGetAllUsers={this.adminGetAllUsers}
                    />
                  ) : null}

                  {thisRow.registrations.length > 0 ? (
                    <RegistrationsTable
                      forName={`${thisRow.firstName} ${thisRow.lastName}`}
                      registrations={thisRow.registrations}
                      users={true}
                      adminGetAllUsers={this.adminGetAllUsers}
                    />
                  ) : null}
                </Fragment>
              )
            }}
            columns={[
              {
                Header: "User",
                columns: [
                  {
                    Header: "Username",
                    accessor: "username",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Admin?",
                    accessor: "admin",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "First Name",
                    accessor: "firstName",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Last Name",
                    accessor: "lastName",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Standing",
                    accessor: "standing"
                  }
                ]
              },
              {
                Header: "Contact Info",
                columns: [
                  {
                    Header: "Buttonhooked",
                    accessor: "email",
                    Cell: row => {
                      return <button onClick={() => console.log(row)}>Row!</button>
                    }
                  },
                  {
                    Header: "Street",
                    accessor: "street",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "City",
                    accessor: "city",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "State",
                    accessor: "state",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Zipcode",
                    accessor: "zipcode",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Phone",
                    accessor: "phone",
                    Cell: this.renderEditable
                  }
                ]
              }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
            {...checkboxProps}
          />
        </div>
      </Fragment>
    );
  }
}