import stripe from 'stripe';
import { Router } from "express";

const stripeSecretKey = process.env.Stripe_Key || '';
const stripeClient = new stripe(stripeSecretKey);

const router=Router();
  router.post('/create-checkout-session', async (req, res) => {
    try {
      const session = await stripeClient.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Ground Booking',
              },
              unit_amount: 200000,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4242/success',
        cancel_url: 'http://localhost:4242/cancel',
      });

      res.redirect( "session.url");
    } catch (error) {
      res.status(500).json({ message:"Something Went Wrong",success:false });
    }
  });

  router.get('/success', async (req, res) => {
    res.send('Payment Successful');
  });

  router.get('/cancel', async (req, res) => {
    res.send('Payment Cancelled');
  });



export default router;
