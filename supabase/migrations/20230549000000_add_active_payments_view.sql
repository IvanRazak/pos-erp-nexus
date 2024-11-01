-- Create a view for active payments (excluding cancelled orders)
CREATE OR REPLACE VIEW active_payments AS
SELECT p.*
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE o.status != 'cancelled';

-- Grant access to the view
GRANT SELECT ON active_payments TO authenticated;
GRANT SELECT ON active_payments TO anon;