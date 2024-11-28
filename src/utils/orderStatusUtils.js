export const getOrderStatus = (totalAmount, paidAmount) => {
  const settings = JSON.parse(localStorage.getItem('orderStatusSettings') || '{}');
  const {
    fullPaymentStatus = 'in_production',
    partialPaymentStatus = 'partial_payment',
    zeroPaymentStatus = 'pending',
    allowZeroPayment = false
  } = settings;

  if (!allowZeroPayment && paidAmount <= 0) {
    throw new Error("Pagamentos com valor zero não estão permitidos nas configurações.");
  }

  if (paidAmount === 0) {
    return zeroPaymentStatus;
  }

  if (paidAmount >= totalAmount) {
    return fullPaymentStatus;
  }

  return partialPaymentStatus;
};