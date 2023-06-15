const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { Customer } = require('../models');
const ApiError = require('../utils/ApiError');

const createCustomer = async (userBody) => {
  if (await Customer.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Customer.create(userBody);
};

const getCustomerByEmail = async (email) => {
  return Customer.findOne({ email });
};

const loginCustomerWithEmailAndPassword = async (email, password) => {
  const customer = await getCustomerByEmail(email);
  if (!customer || !(await customer.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return customer;
};

const queryCustomer = async (filter, options) => {
  const customer = await Customer.paginate(filter, options);
  return customer;
};

const getCustomerById = async (_id) => {
  return Customer.findOne({ _id, active: true });
};

const updateCustomerById = async (customerId, updateBody) => {
  const customer = await getOemById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'customer not found');
  }
  if (updateBody.email && (await Customer.isEmailTaken(updateBody.email, oemId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // //console.log(JSON.stringify(updateBody));
  const updatedCustomer = await Customer.findOneAndUpdate({ _id: customerId }, updateBody, { new: true });
  await updatedCustomer.save();
  return updatedCustomer;
};

const resetPassword = async (customerId, newPassword) => {
  const customer = await getOemById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  const password = await bcrypt.hash(newPassword, 8);
  const resetedPassword = await Customer.findOneAndUpdate({ _id: customerId }, { password });
  await resetedPassword.save();
  return resetedPassword;
};

const changePassword = async (customerId, oldPassword, newPassword) => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'customer not found');
  }
  const isPasswordMatched = await customer.isPasswordMatch(oldPassword);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password doesn't Match");
  }
  const password = await bcrypt.hash(newPassword, 8);
  const updatedPassword = await Customer.findOneAndUpdate({ _id: customerId }, { password });
  await updatedPassword.save();
  return updatedPassword;
};
const listCustomer = async () => {
  const customers = (await Customer.find({ active: true })) || [];
  return customers.map((customer) => {
    return {
      id: customer.id,
      name: customer.name,
    };
  });
};

module.exports = {
  createCustomer,
  loginCustomerWithEmailAndPassword,
  queryCustomer,
  getCustomerById,
  getCustomerByEmail,
  updateCustomerById,
  resetPassword,
  changePassword,
  listCustomer,
};
