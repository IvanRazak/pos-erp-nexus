-- Add cancelled column to payments table
ALTER TABLE payments
ADD COLUMN cancelled BOOLEAN DEFAULT FALSE;

-- Update existing payments based on order status
UPDATE payments p
SET cancelled = TRUE
FROM orders o
WHERE p.order_id = o.id AND o.status = 'cancelled';

-- Create trigger to automatically update payment cancelled status when order is cancelled
CREATE OR REPLACE FUNCTION update_payment_cancelled()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' THEN
        UPDATE payments
        SET cancelled = TRUE
        WHERE order_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_cancelled_trigger
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'cancelled')
    EXECUTE FUNCTION update_payment_cancelled();