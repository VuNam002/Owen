const handleError = (res, error, message = "Đã có lỗi xảy ra") => {
    console.error(message, error);
    res.status(500).json({ 
        success: false, 
        message, 
        error: error.message 
    });
};

module.exports = handleError;
