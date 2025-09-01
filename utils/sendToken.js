exports.sendToken = (user, statusCode, res) => {
    const token = user.getjwttoken();
    const expiresInMilliseconds = process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000;

    const cookieOptions = {
        expires: new Date(Date.now() + expiresInMilliseconds),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.status(statusCode)
       .cookie('adminToken', token, cookieOptions)
       .json({
        success: true,
        id: user._id,
        token,
        expiresIn: expiresInMilliseconds
    });
};