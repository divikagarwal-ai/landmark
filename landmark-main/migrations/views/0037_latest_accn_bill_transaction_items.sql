DROP VIEW IF EXISTS latest_accn_bill_transaction_items;
CREATE VIEW latest_accn_bill_transaction_items
AS
SELECT 
  pav.*,
  lup.first_name,
  lup.last_name,
  lup.personal_email,
  lup.job_title,
  -- lup.manager_id,
  lup.user_type,
  lup.assigned_phone_number,
  lup.shared_email,
  lup.mobile,
  lup.home_phone,
  lup.reports_to,
  lup.phone_ext,
  lup.linkedin_profile,
  lup.hire_date,
  lup.last_day_at_work,
  -- lup.branch,
  lup.department,
  lup.fax,
  lup.date_of_birth,
  lup.sin,
  lup.broker,
  lup.mother_maiden_name,
  lup.photo,
  lup.signature,
  lup.street_address,
  lup.unit_or_suite,
  lup.city,
  lup.province_or_state,
  lup.postal_code,
  lup.country,
  lup.non_active_firm,
  lup.non_active_firm_registered_with_ribo,
  lup.non_active_firm_name,
  lup.business_number,
  lup.bank_name,
  lup.bank,
  -- lup.bank_number,
  lup.transit,
  lup.languages_known,
  lup.documents,
  -- lup.defaults_role,
  lup.csr,
  lup.csr_code,
  lup.marketer,
  lup.marketer_code,
  lup.producer_one,
  lup.producer_one_code,
  lup.producer_two,
  lup.producer_two_code,
  lup.producer_three,
  lup.producer_three_code,
  lup.branch_code,
  lup.branch_uuid,
  lup.branch_name,
  lup.bonus_liability_code,
  lup.bonus_expense_code,
  lup.commission_liability_code,
  lup.commission_expense_code
  -- lup.location_city
FROM accn_bill_transaction_items AS pav
JOIN (
  SELECT MAX(accn_bill_transaction_items_id) AS max_id, customer_id, accn_transaction_id
  FROM accn_bill_transaction_items
  GROUP BY customer_id, accn_transaction_id
) AS subquery ON pav.accn_bill_transaction_items_id = subquery.max_id
LEFT JOIN latest_user_profile lup
ON pav.`account` = lup.`account`;