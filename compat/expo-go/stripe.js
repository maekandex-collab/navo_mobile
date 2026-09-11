const React = require('react');

function StripePublisher({ children }) {
  return children ?? null;
}

function useStripe() {
  const unavailable = async () => ({
    error: { code: 'Canceled', message: 'Stripe native SDK is not available in Expo Go.' },
  });

  return {
    initPaymentSheet: unavailable,
    presentPaymentSheet: unavailable,
    confirmPayment: unavailable,
    createPaymentMethod: unavailable,
    handleNextAction: unavailable,
    retrievePaymentIntent: unavailable,
    initGooglePay: unavailable,
    presentGooglePay: unavailable,
    createToken: unavailable,
  };
}

function useConfirmPayment() {
  return { confirmPayment: async () => ({ error: { message: 'Unavailable in Expo Go' } }), loading: false };
}

function usePaymentSheet() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Unavailable in Expo Go' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Unavailable in Expo Go' } }),
    loading: false,
  };
}

module.exports = {
  StripeProvider: StripePublisher,
  useStripe,
  useConfirmPayment,
  usePaymentSheet,
  CardField: () => null,
  CardForm: () => null,
  ApplePayButton: () => null,
  GooglePayButton: () => null,
};
