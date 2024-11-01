-- Create a view for active payments (payments from non-cancelled orders)
CREATE OR REPLACE VIEW active_payments AS
SELECT 
    payments.*
FROM payments
JOIN orders ON payments.order_id = orders.id
WHERE orders.cancelled = FALSE;

-- Grant access to the view
GRANT SELECT ON active_payments TO authenticated;