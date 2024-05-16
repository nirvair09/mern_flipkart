import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { clearErrors } from '../../actions/orderAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const stripe = useStripe();
    const elements = useElements();
    const [payDisable, setPayDisable] = useState(false);

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paymentData = {
        amount: Math.round(totalPrice),
        email: user.email,
        phoneNo: shippingInfo.phoneNo,
    };

    const client_secret = 'pk_test_51OnjibSD4BCfidA3O7BfGlEFw6KHeZuVS0wzU8VoJovaDyJTZeNSW4ZlCV1dL1Lx4Novd3Q2tEyHPgHpzb1hLi7O00jV30QKYw';

    const submitHandler = async (e) => {
        e.preventDefault();
        setPayDisable(true);

        try {
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: user.name,
                        email: user.email,
                        address: {
                            line1: shippingInfo.address,
                            city: shippingInfo.city,
                            country: shippingInfo.country,
                            state: shippingInfo.state,
                            postal_code: shippingInfo.pincode,
                        },
                    },
                },
            });

            if (result.error) {
                enqueueSnackbar(result.error.message, { variant: "error" });
            } else {
                if (result.paymentIntent.status === "succeeded") {
                    // Handle success scenario
                    // For example, dispatch new order action and redirect to success page
                    dispatch(clearErrors());
                    navigate("/order/success"); // Use navigate instead of history.push
                } else {
                    enqueueSnackbar("Processing Payment Failed!", { variant: "error" });
                }
            }
        } catch (error) {
            setPayDisable(false);
            enqueueSnackbar(error.message, { variant: "error" });
        }
    };

    useEffect(() => {
        if (error) {
            dispatch(clearErrors());
            enqueueSnackbar(error, { variant: "error" });
        }
    }, [dispatch, error, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Flipkart: Secure Payment | Stripe" />

            <main className="w-full mt-20">
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">
                                <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
                                    <div>
                                        <CardNumberElement />
                                    </div>
                                    <div>
                                        <CardExpiryElement />
                                    </div>
                                    <div>
                                        <CardCvcElement />
                                    </div>
                                    <input type="submit" value={`Pay ₹${totalPrice.toLocaleString()}`} disabled={payDisable} className={`${payDisable ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange cursor-pointer"} w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`} />
                                </form>
                            </div>
                        </Stepper>
                    </div>
                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Payment;
