const { Payment, sequelize } = require('../models');

const data = `
1	2	2000	2025-11-27	Bank Transfer	rhsr	tjdt	2025-11-27 08:58:31.658 +00:00	2025-11-27 08:58:31.659 +00:00	0
2	2	3000	2025-11-27	Bank Transfer	fjrtxi	jtycict	2025-11-27 09:09:58.852 +00:00	2025-11-27 09:09:58.852 +00:00	0
3	11	5000	2025-11-27	Bank Transfer	jftyk	kcvhlu,fyu	2025-11-27 09:13:21.017 +00:00	2025-11-27 09:13:21.018 +00:00	0
4	11	3000	2025-11-27	Bank Transfer	grtjdty	jytdkdyt	2025-11-27 09:13:43.944 +00:00	2025-11-27 09:13:43.944 +00:00	0
5	11	3000	2025-11-27	Bank Transfer	thjeydk	ktufl	2025-11-27 09:14:06.658 +00:00	2025-11-27 09:14:06.658 +00:00	0
6	6	3000	2025-11-27	Bank Transfer	hvg	hgchjg	2025-11-27 09:16:52.643 +00:00	2025-11-27 09:16:52.644 +00:00	0
7	6	1000	2025-11-27	Bank Transfer	vhj	hvjv	2025-11-27 09:17:08.424 +00:00	2025-11-27 09:17:08.424 +00:00	0
8	2	6400	2025-11-27	Bank Transfer	dhg	cvhjgc	2025-11-27 09:17:39.441 +00:00	2025-11-27 09:17:39.442 +00:00	0
9	11	6700	2025-11-27	Bank Transfer			2025-11-27 13:22:40.270 +00:00	2025-11-27 13:22:40.274 +00:00	0
10	26	7999.98	2025-11-28	Bank Transfer			2025-11-28 14:00:07.531 +00:00	2025-11-28 14:00:07.533 +00:00	0
11	27	10000	2025-11-29	Bank Transfer	dfbhfg	jjgjctgkh	2025-11-29 05:09:43.206 +00:00	2025-11-29 05:09:43.208 +00:00	0
12	8	200	2025-11-29	UPI	gfE	sgerhsrt	2025-11-29 06:59:08.184 +00:00	2025-11-29 06:59:08.189 +00:00	0
13	15	59	2025-11-29	UPI	djdtyk	kdykudyt	2025-11-29 07:00:14.319 +00:00	2025-11-29 07:00:14.319 +00:00	0
14	4	100	2025-11-29	Bank Transfer	vgjyfk	cgkhkcg	2025-11-29 07:13:34.954 +00:00	2025-11-29 07:13:34.956 +00:00	0
15	4	184.48	2025-11-29	Bank Transfer	vmhgfxk	kcghk	2025-11-29 07:13:55.269 +00:00	2025-11-29 07:13:55.269 +00:00	0
16	27	7000	2025-11-30	UPI	yjtyci	jtfiiky	2025-11-30 19:04:44.614 +00:00	2025-11-30 19:04:44.626 +00:00	0
17	34	200000	2025-12-02	Cash			2025-12-01 09:23:50.511 +00:00	2025-12-01 09:23:50.515 +00:00	0
18	34	274360	2025-12-05	Bank Transfer	adfzbz	gnsfgn	2025-12-01 09:24:16.716 +00:00	2025-12-01 09:24:16.716 +00:00	0
19	31	2000	2025-12-01	Cash			2025-12-01 16:13:21.927 +00:00	2025-12-01 16:13:21.931 +00:00	0
20	31	500	2025-12-01	Bank Transfer			2025-12-01 16:13:51.265 +00:00	2025-12-01 16:13:51.266 +00:00	0
21	35	40	2025-12-02	Bank Transfer			2025-12-02 11:17:46.787 +00:00	2025-12-02 11:17:46.797 +00:00	0
22	35	10	2025-12-02	Bank Transfer			2025-12-02 11:18:18.739 +00:00	2025-12-02 11:18:18.740 +00:00	0
23	35	9	2025-12-02	Bank Transfer			2025-12-02 11:18:34.729 +00:00	2025-12-02 11:18:34.730 +00:00	0
`;

async function seed() {
    try {
        const lines = data.trim().split('\n');
        console.log(`Parsing ${lines.length} lines of payment data...`);

        const payments = lines.map(line => {
            // Split by tab, but handle potential missing tabs by checking length or smart split
            // The provided data looks like TSV
            const cols = line.split('\t');

            return {
                // id: parseInt(cols[0]), // Let DB auto-increment ID to avoid conflicts
                invoice_id: parseInt(cols[1]),
                amount: parseFloat(cols[2]),
                payment_date: cols[3],
                payment_mode: cols[4] || 'Bank Transfer',
                reference_number: cols[5] || null,
                notes: cols[6] || null,
                created_at: cols[7] ? new Date(cols[7]) : new Date(),
                updated_at: cols[8] ? new Date(cols[8]) : new Date(),
                is_deleted: cols[9] === '1' || cols[9] === 'true'
            };
        });

        console.log(`Found ${payments.length} payments. Inserting...`);

        // Use bulkCreate with ignoreDuplicates or updateOnDuplicate if needed
        // Here we'll just insert. If they already exist (by checking invoice_id + timestamp?), might duplicate.
        // Since we ignore the input ID, we might create duplicates if run multiple times.
        // For safety, let's just insert.

        // Validate we probably don't want to insert if same invoice_id and amount, date matches?
        // For now, assume fresh bucket or user knows what they are doing.

        await Payment.bulkCreate(payments);

        console.log('✅ Payments inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error inserting payments:', err);
        process.exit(1);
    }
}

seed();
