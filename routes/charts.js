var express = require('express');
var router = express.Router();
const Model = require('../models/model');
const rp = require('request-promise');
const cheerio = require('cheerio');
require('dotenv').config();
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";
// //Import the mongoose module
// var mongoose = require('mongoose');

/* GET BarChart. */
router.get("/", async function (req, res) {
  let poolnetspace = 0
  try {
    let mining = await Model.Mining.find().sort({time: -1}).exec();
    // mining = mining.sort((a, b) => new Date(b.time) - new Date(a.time));
    var harvesters = []
    var harvesters = [...new Set(mining.map(item => item.harvester))]
    for (let i = 0; i < harvesters.length; i++) {
      for (let j = 0; j < mining.length; j++) {
        if (harvesters[i] === mining[j].harvester) {
          poolnetspace += mining[j].total_plots;
          break
        }
      }
    }
    var minings_count = [...new Set(mining.map(item => item.wallet))].length
    poolnetspace = parseFloat(poolnetspace * 102 / 1024).toFixed(2)
    poolnetspace = poolnetspace + " TiB"

    ////
    const URL = `https://chiacalculator.com/`;
    const options = {
      uri: URL,
      transform: function (body) {
        //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
        return cheerio.load(body);
      },
    };

      async function crawler() {
        try {

          var $ = await rp(options);
        } catch (error) {
          return "";
        }


        let price = $(".chakra-input__group.css-vloijz > input").val()
        return price + " USD";
        
      }
      let price = await crawler();
      res.render('home', { poolnetspace, minings_count, price });
  }
  catch (e) {
    console.log(e)
  }


})

router.get('/:id', async function (req, res, callback) {
  try {
    const userID = req.params.id;
    console.log({userID})
    const mining = await Model.Mining.find({ wallet: userID }).exec();
    let user = await Model.User.find({ wallet: userID }).exec();
    if (typeof mining !== 'undefined' && mining.length > 0 && typeof user !== 'undefined' && user.length == 0) {
      var user_new = new Model.User({ wallet: mining[0].wallet, minimum_payout: process.env.DEFAULT_MIN_PAYOUT, email: mining[0].email });
      
      let saveUser = await user_new.save();
      if (!saveUser) res.render('error', {message: "New user creation failed!"});
    }

    user = await Model.User.find({ wallet: userID }).exec();
    const ledger = await Model.Ledger.find({ wallet: userID }).exec();
    const report_sort = mining.sort((a, b) => new Date(b.time) - new Date(a.time));
    var average_6h = 0;
    var total = 0;
    var current_time = new Date();
    var number_ = 1;
    for (let index = 0; index < report_sort.length; index++) {
      if (Math.abs(current_time - new Date(report_sort[index].time)) / 36e5 < 6) {
        total += report_sort[index].total_plots;
        number_ += 1;
      }
      else break;
    }
    average_6h = total / number_;

    const colors = ["#228B22", "#00FFFF", "#7FFFD4", "#A52A2A", "#8A2BE2", "#0000FF", "#2F4F4F", "#800000"]
    const balance = ledger ? ledger.reduce((a, b) => a + (parseFloat(b.increase).toFixed(11) - parseFloat(b.decrease).toFixed(11) || 0), 0) : 0;
    var harvesters = []
    var harvesters = [...new Set(mining.map(item => item.harvester))]
    harvesters = harvesters.map((item, index) => {
      return { harvester: item, total_plots: 0, color: colors[index % colors.length] }
    })
    var last_report = 0;
    for (let i = 0; i < harvesters.length; i++) {
      for (let j = 0; j < report_sort.length; j++) {
        if (harvesters[i].harvester === report_sort[j].harvester) {
          harvesters[i].total_plots = report_sort[j].total_plots;
          last_report += report_sort[j].total_plots;
          break
        }
      }
    }

    var mining_histories = mining.map(item => {
      return { time: new Date(item.time), amount: item.total_plots }
    }).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);


    var payments = ledger.filter(item => item.increase > 0 && item.tran_id !== "")
    payments = payments.map(item => {
      return { time: new Date(item.time), amount: item.increase - item.decrease }
    })
    var total_paid = payments ? payments.reduce((a, b) => a + (b.increase - b.decrease || 0), 0) : 0;
    const data_chart = report_sort.reverse().map((item) => [new Date(item.time).getTime(), item.total_plots])
    res.render('dashboard/barchart', {
      title: 'My First Bar Chart',
      datai: JSON.stringify([]),
      labeli: JSON.stringify([]),
      harvesters: harvesters,
      user: user[0], ledger: ledger[0], last_report, average_6h, balance: balance, data_chart: JSON.stringify(data_chart),
      total_paid, payments, mining_histories
    });
    console.log({userID11111: userID})
  }
  catch (e) {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    res.render('error', {message: "Your wallet does not exist!"});
  }


});

router.post("/edit_minimumpayout", function (req, res) {
  Model.User.findOne({ email: req.body.email, wallet: req.body.user_id }, function (err, result) {
    if (err) {
      res.status(200).json({ message: "update failed" });
    }
    else {
      if (!result) {
        res.status(200).json({ message: "update failed" });
      }
      else {
        if (req.body.minimum_payout) {
          result.minimum_payout = req.body.minimum_payout
        }
        result.save((err, updatedObject) => {
          if (err) {
            res.status(200).json({ message: "update failed" });
          }
          else {
            res.status(200).json({ message: "update done" });
          }
        })
      }
    }
  })
})


module.exports = router;