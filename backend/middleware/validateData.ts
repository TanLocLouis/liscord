import { validationResult } from "express-validator";
import type { RequestHandler } from 'express';

const validateData: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      fields: errors.mapped(),
    });
  }
  next();
};

export default validateData;