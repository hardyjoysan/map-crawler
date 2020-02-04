module.exports = {
    home: function(req, res, next) {
        res.status(200).send({
            message: 'Map Crawler API 1.0'
        })
    }
}