import React, { Component, Fragment } from 'react';
import { Input } from '../Elements/Form';
import API from '../../utils/API';
import Modal from '../../components/Elements/Modal';
import LoadingModal from '../../components/Elements/LoadingModal';
import ImageModal from '../../components/Elements/ImageModal';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import './AdminTables.css';
import dateFns from 'date-fns';
import { ReservationsTable } from './ReservationsTable';
import { PastRentalsTable } from './PastRentalsTable';

export class RentalsTable extends Component {
  state = {
    modal: {
      isOpen: false,
      body: '',
      buttons: ''
    },
    imageModal: {
      isOpen: false,
      body: '',
    },
    loadingModalOpen: false,
    categories: this.props.categories,
    category: '',
    condition: '',
    note: '',
    images: [],
    selectedFile: null,
    image: null,
    rentals: [],
  };

  componentDidMount = () => {
    this.adminGetAllRentals();
  };

  // Standard input change controller
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  // MODAL TOGGLE FUNCTIONS
  closeModal = () => {
    this.setState({
      modal: { isOpen: false }
    });
  };

  setModal = modalInput => {
    this.setState({
      modal: {
        isOpen: true,
        body: modalInput.body,
        buttons: modalInput.buttons
      }
    });
  };
  // END MODAL TOGGLE FUNCTIONS

  // IMAGEMODAL TOGGLE FUNCTIONS
  toggleImageModal = () => {
    this.setState({
      imageModal: { isOpen: !this.state.imageModal.isOpen }
    });
  };

  setImageModal = modalInput => {
    this.setState({
      imageModal: {
        isOpen: true,
        body: modalInput.body,
      }
    });
  };
  // END IMAGEMODAL TOGGLE FUNCTIONS

  //  Toggles a non-dismissable loading modal to prevent clicks while database ops are ongoing
  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  };

  // Get rentals and set state so the table will display
  adminGetAllRentals = () => {
    API.adminGetAllRentals()
      .then(res => {

        // //  loop through the response array and add a new key/value pair with the formatted rate
        res.data.forEach(r => {
          r.rate = parseFloat(r.dailyRate.$numberDecimal);
        });

        // set state for rentals
        this.setState({
          rentals: res.data
        });
      })
      .catch(err => console.log(err));
  };

  //  Changes rental condition to retire - offered as an alternative to deleting
  retireRental = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminUpdateRental(_id, { condition: 'Retired' })
      .then(() => {
        this.adminGetAllRentals();
        this.toggleLoadingModal();
      });
  };

  rentalDeleteModal = row => {
    const { reservations, pastRentals } = row._original;
    if (pastRentals.length > 0) {
      this.setModal({
        body:
          <Fragment>
            <h4>Items with Past Rental records cannot be deleted.</h4>
            <p>Would you like to retire the item?</p>
          </Fragment>,
        buttons:
          <Fragment>
            <button onClick={this.closeModal}>Nevermind</button>
            <button onClick={() => this.retireRental(row)}>Retire it</button>
          </Fragment>
      })
    } else if (reservations.length > 0) {
      this.setModal({
        body: <h3>You must remove all reservations for this item first.</h3>,
        buttons: <button onClick={this.closeModal}>OK</button>
      })
    } else {
      this.setModal({
        body:
          <Fragment>
            <h3>Warning!</h3><br />
            <h4>Are you sure you want to delete {row.name}?</h4>
            <p>(this is permenent - you cannot undo it and you will lose all data)</p><br />
            <h4>Would you rather retire the item and keep the data?</h4>
            <p>(make sure you contact customers and change any existing reservations)</p><br />
          </Fragment>,
        buttons:
          <Fragment>
            <button onClick={this.closeModal}>Nevermind</button>
            <button onClick={() => this.retireRental(row)}>Retire it</button>
            <button onClick={() => this.deleteRental(row)}>Delete it</button>
          </Fragment>
      });
    }
  };

  deleteRental = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminDeleteRentalItem(_id)
      .then(res => {
        //  keep the loading modal up for at least .5 seconds, otherwise it's just a screen flash and looks like a glitch.
        setTimeout(this.toggleLoadingModal, 500);
        // success modal after the loading modal is gone.
        setTimeout(this.setModal, 500, {
          body: <h3>Item has been successfully deleted</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
        //  query the db and reload the table
        this.adminGetAllRentals();
        // this.toggleLoadingModal();
      })
      .catch(err => console.log(err));
  };

  noteModal = row => {
    const { _id, note } = row._original;
    this.setModal({
      body:
        <Fragment>
          <textarea name="note" onChange={this.handleInputChange} rows="10" cols="80" defaultValue={note}></textarea>
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={() => this.submitNote(_id, this.state.note)}>Submit</button>
          <button onClick={this.closeModal}>Nevermind</button>
        </Fragment>
    })
  }

  submitNote = (id, note) => {
    this.closeModal();
    this.toggleLoadingModal();
    API.adminUpdateRental(id, { note: note })
      .then(response => {
        //  keep the loading modal up for at least .5 seconds, otherwise it's just a screen flash and looks like a glitch.
        setTimeout(this.toggleLoadingModal, 500);
        // success modal after the loading modal is gone.
        setTimeout(this.setModal, 500, {
          body: <h3>Database successfully updated</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
        //  query the db and reload the table
        this.adminGetAllRentals();
      })
      .catch(err => console.log(err));
  }

  //  IMAGE CRUD OPERATIONS FUNCTIONS
  // Gets the modal with the image upload form
  getImageUploadModal = row => {
    this.setModal({
      body:
        <Fragment>
          <h3>Upload An Image</h3>
          {/* form encType must be set this way to take in a file */}
          <form encType="multipart/form-data">
            <Input
              type="file"
              name="file"
              onChange={this.fileSelectedHandler}
            />
          </form>
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={() => this.handleImageUpload(row)}>Submit</button>
          <button onClick={this.closeModal}>I'm done</button>
        </Fragment>

    });
  };

  // the image chosen in the modal form is pushed into state (similar to handleInputChange function)
  fileSelectedHandler = event => {
    const newFile = event.target.files[0];
    this.setState({
      selectedFile: newFile
    });
  };

  //  When the submit button on the image upload modal is pressed, the image is uploaded into the db
  handleImageUpload = row => {
    this.setModal({
      body:
        <Fragment>
          <h3>Loading...</h3>
          <img
            style={{ width: '50px', display: 'block', margin: '50px auto' }}
            src="./../../../loading.gif"
            alt="spinning gears"
          />
        </Fragment>
    });

    const { _id } = row._original;
    const fd = new FormData();
    if (this.state.selectedFile) {
      fd.append('file', this.state.selectedFile, this.state.selectedFile.name);
      API.uploadImage(_id, fd).then(res => {
        this.setState({
          selectedFile: null
        })
        this.closeModal();
        this.getImageUploadModal(row);
      });
    } else {
      this.setModal({
        body: <h3>You have not selected a file to upload</h3>,
        buttons: <button onClick={() => this.getImageUploadModal(row)}>Try Again</button>
      })
    }
  };

  // Gets image names from the db so they can be put into 'img' elements to be streamed for display
  getImageNames = row => {
    this.setModal({
      body:
        <Fragment>
          <h3>Loading...</h3>
          <img
            style={{ width: '50px', display: 'block', margin: '50px auto' }}
            src="./../../../loading.gif"
            alt="spinning gears"
          />
        </Fragment>
    });
    const { _id } = row._original;
    API.getImageNames(_id).then(res => {
      if (res.data.length === 0) {
        setTimeout(this.setModal, 500, {
          body: <h3>No images to display</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
      } else {
        this.closeModal();
        this.getImageModal(res.data, row);
      }
    });
  };

  // Once image names have been retrieved, they are placed into img tags for display inside a modal
  getImageModal = (images, row) => {
    this.setImageModal({
      body:
        <Fragment>
          {images.map(image => (
            <div key={image._id} className="rental-img-div">
              <p>Uploaded {dateFns.format(image.uploadDate, 'MMM Do YYYY hh:mm a')} </p>
              <img className="rental-img" src={`file/image/${image.filename}`} alt="rental condition" />
              <button onClick={() => this.deleteImage(image._id, row)}>Delete</button>
            </div>
          ))}
        </Fragment>
    });
  };

  // Deletes an image, then closes the modal so when getImageNames toggles the modal, it will reopen it
  deleteImage = (image, row) => {
    this.setModal({
      body:
        <Fragment>
          <h3>Loading...</h3>
          <img
            style={{ width: '50px', display: 'block', margin: '50px auto' }}
            src="./../../../loading.gif"
            alt="spinning gears"
          />
        </Fragment>
    });
    const { _id } = row._original;
    API.deleteImage(image, _id).then(res => {
      this.toggleImageModal();
      this.getImageNames(row);
    });
  };
  //  END - IMAGE CRUD OPERATIONS FUNCTIONS

  //  Update Row - sends current field info to db and updates that item
  updateRow = row => {
    //  extract variables from the row object
    const { category, condition, dateAcquired, maker, name, rate, sku, timesRented, _id } = row._original;

    let unixDate;
    if (typeof dateAcquired === "string") unixDate = dateFns.format(dateAcquired, "X");
    else unixDate = dateFns.format(dateAcquired * 1000, "X");

    if (dateAcquired.length < 6 || unixDate === "Invalid Date") {
      return this.setModal({
        body:
          <Fragment>
            <h4>Please enter a valid date format</h4>
            <p>(e.g. '01/25/2016' or 'Dec 14 2012')</p>
          </Fragment>,
        buttons: <button onClick={this.closeModal}>OK</button>
      })
    }
    //  wait until here to trigger the loading modal - after the date has been validated - otherwise, the loadingmodal must be closed again inside the "if (dateAcquired.length...)" block, and the timing is such that the loading modal just ends up staying open.
    this.toggleLoadingModal();

    let newCategory;
    if (this.state.category) newCategory = this.state.category;
    else newCategory = category;

    let newCondition;
    if (this.state.condition) newCondition = this.state.condition;
    else newCondition = condition;

    // if rate exists (it should, but to avoid an error, checking first...) and it hasn't been changed, it will be a number type because the formatting occurs in the renderEditableRate function (the actual value remains a number type until it is changed) and so the .split method won't exist for it (that's a string method), causing an 'is not a function' error
    let newRate;
    if (rate) {
      if (typeof rate === "string") newRate = rate.split('').filter(x => x !== '$').join('');
      else newRate = rate;
    }

    const updateObject = {
      category: newCategory,
      condition: newCondition,
      dailyRate: newRate,
      dateAcquired: unixDate,
      maker: maker,
      name: name,
      sku: sku,
      timesRented: timesRented
    };

    API.adminUpdateRental(_id, updateObject)
      .then(response => {
        if (response.status === 200) {
          //  keep the loading modal up for at least .5 seconds, otherwise it's just a screen flash and looks like a glitch.
          setTimeout(this.toggleLoadingModal, 500);
          // success modal after the loading modal is gone.
          setTimeout(this.setModal, 500, {
            body: <h3>Database successfully updated</h3>,
            buttons: <button onClick={this.closeModal}>OK</button>
          });
          //  query the db and reload the table
          this.adminGetAllRentals();
        }
      })
      .catch(err => console.log(err));
  };

  // editable react table - this was necessary so the sort function would properly sort numbers.
  renderEditableRate = cellInfo => {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const rentals = [...this.state.rentals];
          rentals[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ rentals: rentals });
        }}
        dangerouslySetInnerHTML={{
          __html: (
            //  When you enter a new rate that includes anything other than digits (e.g. a dollar sign)
            //  It renders as 'NaN', which shows in the cell for just a second before the change
            //  So, if the cell includes 'NaN', just render what's already in the cell
            //  Otherwise, display the formatted rate.
            `$${parseFloat(this.state.rentals[cellInfo.index][cellInfo.column.id]).toFixed(2)}`.includes('NaN')
              ?
              this.state.rentals[cellInfo.index][cellInfo.column.id]
              :
              `$${parseFloat(this.state.rentals[cellInfo.index][cellInfo.column.id]).toFixed(2)}`
          )
        }}
      />
    );
  };

  // editable react table for the date - allows for date formatting within the cell
  renderEditableDate = cellInfo => {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const rentals = [...this.state.rentals];
          rentals[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ rentals: rentals });
        }}
        dangerouslySetInnerHTML={{
          //  When you enter a new date that's not in unix time, the below format renders it as "Invalid Date"
          //  As a result, in the split second before the database updates, the field says "Invalid Date"
          //  So, if invalid date, just display what's being typed in. Otherwise, display the formatted version.
          __html: (
            dateFns.format(this.state.rentals[cellInfo.index][cellInfo.column.id] * 1000, 'MMM Do YYYY') === "Invalid Date"
              ?
              this.state.rentals[cellInfo.index][cellInfo.column.id]
              :
              dateFns.format(this.state.rentals[cellInfo.index][cellInfo.column.id] * 1000, 'MMM Do YYYY'))
        }}
      />
    );
  };

  // editable react table
  renderEditable = cellInfo => {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const rentals = [...this.state.rentals];
          rentals[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ rentals: rentals });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.rentals[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  };

  render() {

    return (
      <Fragment>
        <Modal
          show={this.state.modal.isOpen}
          closeModal={this.closeModal}
          body={this.state.modal.body}
          buttons={this.state.modal.buttons}
        />
        <ImageModal
          show={this.state.imageModal.isOpen}
          toggleImageModal={this.toggleImageModal}
          body={this.state.imageModal.body}
        />
        <LoadingModal show={this.state.loadingModalOpen} />
        <div className="main-table-container rental-table">
          <div className="table-title-div">
            <h2>Rentals Table <button onClick={this.props.toggleRentals}>hide table</button></h2>
          </div>

          <ReactTable
            data={this.state.rentals}
            filterable
            SubComponent={row => {
              //  thisReservation grabs the reservations from this.state.rentals that matches the row index - it grabs the reservations for this rental item.
              const thisRow = this.state.rentals[row.row._index];
              return (
                <div className="sub-table-container">
                  {thisRow.reservations.length > 0 ? (
                    <ReservationsTable
                      forName={thisRow.name}
                      filterable
                      reservations={thisRow.reservations}
                      rentals={true}
                      adminGetAllRentals={this.adminGetAllRentals}
                    />
                  ) : null}

                  {thisRow.pastRentals.length > 0 ? (
                    <PastRentalsTable
                      forName={thisRow.name}
                      filterable
                      pastRentals={thisRow.pastRentals}
                      rentals={true}
                      adminGetAllRentals={this.adminGetAllRentals}
                    />
                  ) : null}
                </div>
              );
            }}
            columns={[
              {
                Header: 'Actions',
                columns: [
                  {
                    Header: 'Item',
                    id: 'item',
                    width: 110,
                    Cell: row => {
                      return (
                        <div className="table-icon-div">
                          <div className="fa-sync-div table-icon-inner-div">
                            <i onClick={() => this.updateRow(row.row)} className="table-icon fas fa-sync fa-lg"></i>
                            <span className="fa-sync-tooltip table-tooltip">upload changes</span>
                          </div>
                          <div className="fa-trash-alt-div table-icon-inner-div">
                            <i onClick={() => this.rentalDeleteModal(row.row)} className="table-icon fas fa-trash-alt fa-lg"></i>
                            <span className="fa-trash-alt-tooltip table-tooltip">delete rental</span>
                          </div>
                          <div className="fa-sticky-note-div table-icon-inner-div">
                            <i onClick={() => this.noteModal(row.row)} className="table-icon far fa-sticky-note fa-lg"></i>
                            <span className="fa-sticky-note-tooltip table-tooltip">see/edit notes</span>
                          </div>
                        </div>
                      )
                    }
                  },
                  {
                    Header: 'Images',
                    id: 'images',
                    Cell: row => {
                      return (
                        <div className="table-icon-div">
                          <div className="fa-upload-div table-icon-inner-div">
                            <i onClick={() => this.getImageUploadModal(row.row)} className="table-icon fas fa-upload fa-lg"></i>
                            <span className="fa-upload-tooltip table-tooltip">upload images</span>
                          </div>
                          <div className="fa-images-div table-icon-inner-div">
                            <i onClick={() => this.getImageNames(row.row)} className="table-icon fas fa-images fa-lg"></i>
                            <span className="fa-images-tooltip table-tooltip">see images</span>
                          </div>
                        </div>
                      )
                    },
                    width: 80
                  },
                ]
              },
              {
                Header: 'Rental Info',
                columns:
                  [
                    {
                      Header: 'Name',
                      accessor: 'name',
                      Cell: this.renderEditable
                    },
                    {
                      Header: 'Type',
                      accessor: 'category',
                      width: 115,
                      Cell: row => {
                        return (
                          <Fragment>
                            <form>
                              <div className="table-select">
                                <select
                                  name="category"
                                  onChange={this.handleInputChange}
                                >
                                  <option>{row.row.category}</option>
                                  {this.state.categories ? this.state.categories.map(cat => (
                                    cat.category !== row.row.category ? <option key={cat._id}>{cat.category}</option> : null
                                  )) : null}
                                </select>
                              </div>
                            </form>
                          </Fragment>
                        )
                      }
                    },
                    {
                      Header: 'Mfr.',
                      accessor: 'maker',
                      Cell: this.renderEditable
                    },
                    {
                      Header: 'SKU',
                      accessor: 'sku',
                      Cell: this.renderEditable
                    }
                  ]
              },
              {
                Header: 'Rental Details',
                columns: [
                  {
                    Header: 'Rate',
                    accessor: 'rate',
                    width: 70,
                    Cell: this.renderEditableRate
                  },
                  {
                    Header: 'Date Acq.',
                    accessor: "dateAcquired",
                    Cell: this.renderEditableDate,
                  },
                  {
                    Header: 'x Rented',
                    accessor: 'timesRented',
                    Cell: this.renderEditable
                  },
                  {
                    Header: 'Condition',
                    accessor: 'condition',
                    width: 85,
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            {/* using the Select and Option components in a modal seems to make everything stop working... */}
                            <div className="table-select">
                              <select
                                name="condition"
                                // for some reason, setting the value={this.state.whatever} in a modal doesn't work. The onChange still updates state, but the input (dropdown) is uncontrolled.
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.condition}</option>
                                {row.row.condition !== "New" ? <option>New</option> : null}
                                {row.row.condition !== "Good" ? <option>Good</option> : null}
                                {row.row.condition !== "Working" ? <option>Working</option> : null}
                                {row.row.condition !== "Disrepair" ? <option>Disrepair</option> : null}
                                {row.row.condition !== "Retired" ? <option>Retired</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  }
                ]
              }
            ]}
            defaultSorted={[
              {
                id: "name",
                desc: false
              }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          // {...checkboxProps}
          />
        </div>
      </Fragment>
    );
  }
}