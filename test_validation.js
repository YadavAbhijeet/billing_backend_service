const { invoiceValidationSchema, invoiceItemValidationSchema } = require('./utils/validators');

const payload = {
    "invoiceDetails": {
        "invoice_number": "65",
        "challan_no": "52",
        "po_no": "86",
        "business_id": 1,
        "customer_id": 5,
        "billing_address_id": 10,
        "shipping_address_id": 10,
        "invoice_date": "2025-11-28",
        "due_date": "2025-11-30",
        "place_of_supply": "Interstate",
        "subtotal": 15000,
        "cgst_amount": 0,
        "sgst_amount": 0,
        "igst_amount": 2250,
        "total_tax": 2250,
        "discount_amount": 0,
        "total_amount": 17250,
        "amount_in_words": "Seventeen Thousand Two Hundred Fifty Only",
        "payment_mode": "",
        "payment_status": "Pending",
        "notes": "jklh",
        "pdf_path": ""
    },
    "invoiceItems": [
        {
            "product_name": "Dhananjay apt",
            "hsn_sac_code": "400708",
            "description": "",
            "quantity": 1,
            "unit_price": 15000,
            "unit_type": "service",
            "gst_rate": "15",
            "taxable_value": 15000,
            "cgst_rate": 0,
            "cgst_amount": 0,
            "sgst_rate": 0,
            "sgst_amount": 0,
            "igst_rate": 15,
            "igst_amount": 2250,
            "total_amount": 17250,
            "product_id": 8
        }
    ]
};

console.log("Testing Validation...");

const { error: invoiceError } = invoiceValidationSchema.validate(payload.invoiceDetails, { allowUnknown: true });
if (invoiceError) {
    console.error("❌ Invoice Validation Failed:", invoiceError.details[0].message);
} else {
    console.log("✅ Invoice Details Valid");
}

const { error: itemsError } = invoiceItemValidationSchema.validate(payload.invoiceItems, { allowUnknown: true });
if (itemsError) {
    console.error("❌ Items Validation Failed:", itemsError.details[0].message);
} else {
    console.log("✅ Invoice Items Valid");
}
