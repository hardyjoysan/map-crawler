const puppeteer = require('puppeteer');

module.exports = {
    home: function(req, res, next) {
        res.status(200).send({
            message: 'Map Crawler API 1.0'
        })
    },
    getCompanies: async function(req, res, next) {
        var data = [];
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.google.com/search?q=kakkanad+it+companies&npsic=0&rflfq=1&rlha=0&rllag=10008591,76354452,1133&tbm=lcl');
        await page.type('#search', 'Headless Chrome');
        const resultsSelector = '.cXedhc';
        await page.waitForSelector(resultsSelector);

        const links = await page.evaluate(resultsSelector => {
            const blocks = Array.from(document.querySelectorAll(resultsSelector));
            return blocks.map(block => {
                var dbg0pd = block.getElementsByClassName('dbg0pd')[0];
                if (dbg0pd && dbg0pd !== undefined) {
                    var name = dbg0pd.textContent.trim();
                }

                var phone = block.querySelector('.rllt__details').lastElementChild.lastElementChild.innerHTML;

                return {"name": name, "phone": phone}
                
            });
        }, resultsSelector);
        data.push(links);

        res.status(200).send({
            companies: data
        })
    },
}