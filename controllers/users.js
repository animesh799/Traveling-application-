const User = require('../models/user')

module.exports.renderregister = (req, res) => {
    res.render('users/register')
}

module.exports.registeruser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = await new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', "welcome to yelp camp")
            res.redirect('/campgrounds')
        })
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderlogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!!')
    const redirectPath = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    res.redirect(redirectPath)
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Good Bye');
    res.redirect('/campgrounds')
}