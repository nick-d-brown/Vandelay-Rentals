import React, { Component, Fragment } from "react";
import Modal from "../../components/Modal";
import { AddCourseForm, AddRentalForm, AddSaleItemForm, AddUserForm, AddCategoryForm } from "../../components/AdminForms";

export class AdminForms extends Component {
  state = {
    modal: {
      isOpen: false,
      header: "",
      body: "",
      footer: ""
    },
    forms: {
      addCourse: false,
      addRental: true,
      addSaleItem: false,
      addUser: false,
      addCategory: false
    }
  };

  toggleModal = () => {
    this.setState({
      modal: { isOpen: !this.state.modal.isOpen }
    });
  }

  setModal = (modalInput) => {
    this.setState({
      modal: {
        isOpen: !this.state.modal.isOpen,
        header: modalInput.header,
        body: modalInput.body,
        footer: modalInput.footer
      }
    });
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  toggleCourseForm = () => {
    this.setState({
      forms: {
        addCourse: true,
        addRental: false,
        addSaleItem: false,
        addUser: false,
        addCategory: false
      }
    });
  }

  toggleRentalForm = () => {
    this.setState({
      forms: {
        addCourse: false,
        addRental: true,
        addSaleItem: false,
        addUser: false,
        addCategory: false
      }
    });
  }

  toggleSaleItemForm = () => {
    this.setState({
      forms: {
        addCourse: false,
        addRental: false,
        addSaleItem: true,
        addUser: false,
        addCategory: false
      }
    });
  }

  toggleUserForm = () => {
    this.setState({
      forms: {
        addCourse: false,
        addRental: false,
        addSaleItem: false,
        addUser: true,
        addCategory: false
      }
    });
  }

  toggleCategoryForm = () => {
    this.setState({
      forms: {
        addCourse: false,
        addRental: false,
        addSaleItem: false,
        addUser: false,
        addCategory: true
      }
    });
  }

  render() {
    return (
      <Fragment>
        <Modal
          show={this.state.modal.isOpen}
          toggleModal={this.toggleModal}
          header={this.state.modal.header}
          body={this.state.modal.body}
          footer={this.state.modal.footer}
        />
        <div id="admin-forms-container">
          {this.state.forms.addCourse ? (
            <Fragment>
              <div className="admin-forms-toggle-div">
                <h3>Select a Form</h3>
                <button className="admin-toggle-btn">Course</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleRentalForm}>Rental</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleSaleItemForm}>Sale Item</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleUserForm}>User</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCategoryForm}>Category</button>
              </div>
              <div className="admin-form-div">
                <h2>New Course</h2>
                <AddCourseForm />
              </div>
            </Fragment>
          ) : null}

          {this.state.forms.addRental ? (
            <Fragment>
              <div className="admin-forms-toggle-div">
                <h3>Select a Form</h3>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCourseForm}>Course</button>
                <button className="admin-toggle-btn">Rental</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleSaleItemForm}>Sale Item</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleUserForm}>User</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCategoryForm}>Category</button>
              </div>
              <div className="admin-form-div">
                <h2>New Rental</h2>
                <AddRentalForm />
              </div>
            </Fragment>
          ) : null}

          {this.state.forms.addSaleItem ? (
            <Fragment>
              <div className="admin-forms-toggle-div">
                <h3>Select a Form</h3>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCourseForm}>Course</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleRentalForm}>Rental</button>
                <button className="admin-toggle-btn">Sale Item</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleUserForm}>User</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCategoryForm}>Category</button>
              </div>
              <div className="admin-form-div">
                <h2>New Sale Item</h2>
                <AddSaleItemForm />
              </div>
            </Fragment>
          ) : null}

          {this.state.forms.addUser ? (
            <Fragment>
              <div className="admin-forms-toggle-div">
                <h3>Select a Form</h3>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCourseForm}>Course</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleRentalForm}>Rental</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleSaleItemForm}>Sale Item</button>
                <button className="admin-toggle-btn">User</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCategoryForm}>Category</button>
              </div>
              <div className="admin-form-div">
                <h2>New User</h2>
                <AddUserForm />
              </div>
            </Fragment>
          ) : null}

          {this.state.forms.addCategory ? (
            <Fragment>
              <div className="admin-forms-toggle-div">
                <h3>Select a Form</h3>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleCourseForm}>Course</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleRentalForm}>Rental</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleSaleItemForm}>Sale Item</button>
                <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleUserForm}>User</button>
                <button className="admin-toggle-btn">Category</button>
              </div>
              <div className="admin-form-div">
                <h2>New Category</h2>
                <AddCategoryForm />
              </div>
            </Fragment>
          ) : null}
        </div>
      </Fragment>
    );
  }
}