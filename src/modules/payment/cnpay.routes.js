import express from 'express';
import { createPaymentUrl, vnpayReturn } from './vnpay.controller.js';

const paymenRouter = express.Router();

paymenRouter.post('/create-url', createPaymentUrl);
paymenRouter.get('/vnpay-return', vnpayReturn);

export default paymenRouter;