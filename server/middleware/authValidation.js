const {
    body,
    validationResult
} = require("express-validator");


const registerValidator = [

    body("fullName").trim().notEmpty().withMessage("Full name is required").isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
    body("email").trim().notEmpty().withMessage("Email address is required").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
    body("mobileNumber").trim().notEmpty().withMessage("Mobile number is required").matches(/^[0-9]{10}$/).withMessage("Enter a valid 10-digit mobile number"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").notEmpty()
        .withMessage(
            "Please confirm your password"
        )
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(
                    "Passwords do not match"
                );
            }
            return true;
        }),
];

const loginValidator = [
    body("email").trim().notEmpty().withMessage("Email address is required").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];


const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};
module.exports = { registerValidator, loginValidator, validateRequest };