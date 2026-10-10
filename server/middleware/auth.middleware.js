const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("AUTH HEADER:", authHeader);
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }
        const decoded = jwt.verify( token,  process.env.JWT_SECRET  );
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("AUTH MIDDLEWARE ERROR:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

module.exports = authMiddleware;