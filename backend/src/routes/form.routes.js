import { Router } from 'express';
import { fetchAllForms, fetchForm, submitRopaForm } from '../controllers/form.controller.js';

const router = Router();

router.post('/submit', submitRopaForm);
router.get('/single', fetchForm);
router.get('/', fetchAllForms);

export default router;