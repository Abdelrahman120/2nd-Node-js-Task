import { Router } from "express";
import { body, query } from 'express-validator';
import { createUser, getUsers, updateUser, deleteUser } from '../Controllers/user.controller.js';

const router = Router();

const userValidationRules = [
  body('name').isString().withMessage('Name must be a string'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  body('Country').isString().withMessage('Country must be a string'),
];

const userIdValidationRules = [
  query('id').isUUID().withMessage('Invalid ID format')
];

router.post('/create', userValidationRules, createUser);
router.get('/list', getUsers);
router.put('/update', userIdValidationRules.concat(userValidationRules), updateUser);
router.delete('/delete', userIdValidationRules, deleteUser);

export default router;

