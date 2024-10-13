const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

mongoose.connect('mongodb://localhost:27017/DATABASENAME')
    .then(() => {
        console.log('Database connected successfully!');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls });
});

app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
});

// New route to handle URL deletion
app.delete('/shortUrls/:shortUrl', async (req, res) => {
    await ShortUrl.deleteOne({ short: req.params.shortUrl });
    res.redirect('/');
});

// New route to handle editing the short URL
app.post('/shortUrls/:shortUrl/edit', async (req, res) => {
    const { newShortUrl } = req.body;
    await ShortUrl.updateOne({ short: req.params.shortUrl }, { short: newShortUrl });
    res.redirect('/');
});

app.listen(process.env.PORT || 5000);
