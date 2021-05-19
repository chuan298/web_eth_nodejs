var express = require('express');
var router = express.Router();
const Model = require('../models/model');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
//Import the mongoose module
var mongoose = require('mongoose');

/* GET BarChart. */
router.get('/:id', async function (req, res, callback) {
  try {
    const userID = req.params.id;
    const doc = await Model.Mining.find({ wallet: userID }).exec();
    const user = await Model.User.findOne({ wallet: userID }).exec();
    const ledger = await Model.Ledger.findOne({ wallet: userID }).exec();
    const report_sort = doc.sort((a, b) => new Date(b.time) - new Date(a.time))
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

    const balance = ledger ? [...ledger].reduce((a, b) => a + (b.increase - b.decrease || 0), 0) : 0;
    var harvesters = []
    var harvesters = [...new Set(doc.map(item => item.harvester))]
    harvesters = harvesters.map(item => {
      return {harvester: item, total_plots: 0}
    })
    for(let i = 0; i<harvesters.length; i++){
      for(let j=0; j<doc.length; j++){
        if(harvesters[i].harvester === doc[j].harvester){
          harvesters[i].total_plots += doc[j].total_plots;
        }
      }
    }
    // console.log(report_sort[0].total_plots, average_6h, balance)

    const data_chart = report_sort.reverse().map((item) => [new Date(item.time).getTime(), item.total_plots])
    console.log(harvesters)
    res.render('dashboard/barchart', {
      title: 'My First Bar Chart',
      datai: JSON.stringify([]),
      labeli: JSON.stringify([]),
      harvesters: harvesters,
      user, ledger, last_report: report_sort[0].total_plots, average_6h, balance: balance, data_chart: JSON.stringify(data_chart)
    });
  }
  catch (e) {
    res.render('error');
  }

  // blogPostData(function(result){
  //   var month_data = result.month_data;
  //   var number_of_posts_data = result.number_of_posts_data;

  //   console.log(month_data, number_of_posts_data);
  //   res.render('dashboard/barchart', { 
  //     title: 'My First Bar Chart',
  //     datai: JSON.stringify(number_of_posts_data),
  //     labeli: JSON.stringify(month_data)
  //    });
  // });
});

router.post("/edit_minimumpayout", function (req, res) {
  Model.User.findOne({email: req.body.email, wallet: req.body.user_id}, function (err, result) {
    if(err){
      console.log("FFFFFFFFFFFF")
      res.status(200).json({message: "update failed"});
    }
    else{
      if(!result){
        res.status(200).json({message: "update failed"});
      }
      else{
        if(req.body.minimum_payout){
          result.minimum_payout = req.body.minimum_payout
        }
        setTimeout(function(){ alert("Hello"); }, 3000);
        result.save((err, updatedObject) => {
          if(err){
            res.status(200).json({message:"update failed"});
          }
          else{
            res.status(200).json({message:"update done"});
          }
        })
      }
    }
  })
})


module.exports = router;