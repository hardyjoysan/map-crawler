const puppeteer = require('puppeteer');
const json2csv = require("json2csv").parse;
const fs = require("fs");
const path = "./results.csv";

module.exports = {
    home: function(req, res, next) {
        res.status(200).send({
            message: 'Map Crawler API 1.0'
        })
    },
    scraping: async function(req, res, next) {
        var results = [];
        
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.google.com/search?q=kakkanad+it+companies&npsic=0&rflfq=1&rlha=0&rllag=10008591,76354452,1133&tbm=lcl');
        await page.type('#search', 'Headless Chrome');
        await page.waitForSelector('.cXedhc');

        var lastPageNumber = 50;
        for (let index = 0; index < lastPageNumber; index++) {
            await page.waitFor(1000);
            if (page && page !== null & page !== undefined) {
                results = results.concat(await extractInfo(page));
            }
            
            if (index != lastPageNumber - 1) {
                const btn = await page.$('a#pnnext');
                if (btn && btn !== null & btn !== undefined) {
                    await btn.evaluate( btn => btn.click() );
                }
            }
        }

        await page.close();
        await browser.close();

        results = removeDuplicate(results);

        var csv = json2csv(results, { fields: ["name", "phone"]});
        fs.writeFileSync(path, csv);

        res.status(200).send({companies: results})
    }
}

async function extractInfo(page) {
    return page.evaluate(() => {
        let data = [];
        let blocks = Array.from(document.querySelectorAll('.cXedhc'));

        for (var block of blocks) {
            var name, phone;
            var dbg0pd = block.getElementsByClassName('dbg0pd')[0];
            if (dbg0pd) {
                name = dbg0pd.textContent.trim();
            }

            if (block.querySelector('.rllt__details').lastElementChild.lastElementChild) {
                phone = block.querySelector('.rllt__details').lastElementChild.lastElementChild.innerHTML;
                var phonereg = /^[- +()]*[0-9][- +()0-9]*$/;
                phone = phone.match(phonereg) ? phone : "";
            }
            
            data.push({"name": name, "phone": phone});
        }

        return data;
    });
}

function removeDuplicate(data) {
    var obj = {};
    for ( var i = 0, len = data.length; i < len; i++ )
        obj[data[i]['name']] = data[i];

    data = new Array();
    for ( var key in obj ) data.push(obj[key]);

    return data
}