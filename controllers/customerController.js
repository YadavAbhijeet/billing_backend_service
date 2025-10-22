const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const { company_name, contact_person, email, phone, billing_address, shipping_address, gstin, pan_no, state, pincode, industry } = req.body;
    const customer = await Customer.create({
      company_name,
      contact_person,
      email,
      phone,
      billing_address,
      shipping_address,
      gstin,
      pan_no,
      state,
      pincode,
      industry
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({ where: { is_deleted: false } });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { id: req.params.id, is_deleted: false } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { company_name, contact_person, email, phone, billing_address, shipping_address, gstin, pan_no, state, pincode, industry } = req.body;
    const [updated] = await Customer.update({
      company_name,
      contact_person,
      email,
      phone,
      billing_address,
      shipping_address,
      gstin,
      pan_no,
      state,
      pincode,
      industry
    }, { where: { id: req.params.id, is_deleted: false } });
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    const updatedCustomer = await Customer.findByPk(req.params.id, { where: { is_deleted: false } });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, { where: { is_deleted: false } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Set is_deleted flag to true for soft delete
    customer.is_deleted = true;
    await customer.save();

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};