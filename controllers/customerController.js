const Customer = require('../models/Customer');
const Address = require('../models/Address');
const sequelize = require('../config/database');

exports.createCustomer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      company_name,
      primary_contact_person,
      primary_email,
      primary_phone,
      gstin,
      pan_no,
      payment_terms,
      addresses
    } = req.body;

    // Create customer with user_id
    const customer = await Customer.create({
      company_name,
      primary_contact_person,
      primary_email,
      primary_phone,
      gstin,
      pan_no,
      payment_terms: payment_terms || 0,
      user_id: req.user.id // ✅ Attach user_id
    }, { transaction: t });

    // Create addresses if provided
    if (addresses && Array.isArray(addresses)) {
      const addressPromises = addresses.map(address => {
        return Address.create({
          customerId: customer.id,
          address_type: address.address_type,
          contact_person: address.contact_person,
          contact_email: address.contact_email,
          contact_phone: address.contact_phone,
          company_name: address.company_name,
          street_address: address.street_address,
          city: address.city,
          state: address.state,
          country: address.country || 'India',
          pincode: address.pincode,
          is_default: address.is_default || false
        }, { transaction: t });
      });

      await Promise.all(addressPromises);
    }

    await t.commit();

    // Fetch the customer with addresses
    const customerWithAddresses = await Customer.findOne({
      where: { id: customer.id },
      include: [{
        model: Address,
        as: 'addresses'
      }]
    });

    res.status(201).json(customerWithAddresses);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        is_deleted: false,
        user_id: req.user.id // ✅ Filter by user
      },
      include: [{
        model: Address,
        as: 'addresses',
        where: { is_deleted: false },
        required: false
      }]
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        is_deleted: false,
        user_id: req.user.id // ✅ Security check
      },
      include: [{
        model: Address,
        as: 'addresses',
        where: { is_deleted: false },
        required: false
      }]
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { company_name, primary_contact_person, primary_email, primary_phone, gstin, pan_no, payment_terms, addresses } = req.body;

    // Update customer
    const [updated] = await Customer.update({
      company_name,
      primary_contact_person,
      primary_email,
      primary_phone,
      gstin,
      pan_no,
      payment_terms: payment_terms !== undefined ? payment_terms : 0
    }, {
      where: {
        id: req.params.id,
        is_deleted: false,
        user_id: req.user.id // ✅ Security check
      },
      transaction: t
    });

    if (!updated) {
      await t.rollback();
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Handle addresses array if provided
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        if (addr.id) {
          // If address has id, update or soft-delete it
          if (addr._delete) {
            await Address.update({ is_deleted: true }, { where: { id: addr.id, customerId: req.params.id }, transaction: t });
          } else {
            const updateFields = {
              address_type: addr.address_type,
              contact_person: addr.contact_person,
              contact_email: addr.contact_email,
              contact_phone: addr.contact_phone,
              company_name: addr.company_name,
              street_address: addr.street_address,
              city: addr.city,
              state: addr.state,
              country: addr.country || 'India',
              pincode: addr.pincode,
              is_default: !!addr.is_default,
              is_deleted: addr.is_deleted ? true : false
            };
            await Address.update(updateFields, { where: { id: addr.id, customerId: req.params.id }, transaction: t });
          }
        } else {
          // Create new address
          await Address.create({
            customerId: req.params.id,
            address_type: addr.address_type,
            contact_person: addr.contact_person,
            contact_email: addr.contact_email,
            contact_phone: addr.contact_phone,
            company_name: addr.company_name,
            street_address: addr.street_address,
            city: addr.city,
            state: addr.state,
            country: addr.country || 'India',
            pincode: addr.pincode,
            is_default: !!addr.is_default
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    const updatedCustomer = await Customer.findOne({
      where: { id: req.params.id, is_deleted: false },
      include: [{ model: Address, as: 'addresses', where: { is_deleted: false }, required: false }]
    });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        is_deleted: false,
        user_id: req.user.id // ✅ Security check
      },
      transaction: t
    });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Soft-delete customer
    await Customer.update({ is_deleted: true }, { where: { id: req.params.id }, transaction: t });

    // Soft-delete all addresses for this customer
    await Address.update({ is_deleted: true }, { where: { customerId: req.params.id }, transaction: t });

    await t.commit();

    res.status(200).json({ message: 'Customer and addresses deleted successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};