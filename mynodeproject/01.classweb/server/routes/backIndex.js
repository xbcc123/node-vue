var express = require('express');
var router = express.Router();
var handler = require('./dbhandler.js');
var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectId;
var formidable = require('formidable');
var fs = require("fs");

//往表backIndex里面增加一条数据
router.post("/add", function(req, res, next) {
	if(req.body) {
		handler(req, res, "add", "backIndex", {
			title: req.body.title,
			description: req.body.description
		}, function(data) {
			if(data) {
				res.send({
					success: "true"
				})
			} else {
				console.log("错误")
				res.send({
					success: "false"
				})
			}
		})
	}

});

//得到表backIndex的数据

router.post("/find", function(req, res, next) {
	handler(req, res, "find", "backIndex", req.body, function(result) {
		if(result) {
			res.send(result)
		} else {
			res.send({
				"error": true
			})
		}
	})
});

//更新数据
router.post("/update", function(req, res, next) {
	if(req.body._id) {
		var selectors = [{
				"_id": ObjectId(req.body._id)
			}, //这里需要这样写
			{
				"$set": {
					title: req.body.title,
					description: req.body.description
				}
			}
		];
		handler(req, res, "update", "backIndex", selectors, function(result) {
			if(result) {
				res.send({
					"success": true
				});
			} else {
				res.send({
					"error": true
				})
			}
		});
	};
});

//新增图片
router.post("/courseList", function(req, res, next) {
	var form = new formidable.IncomingForm();
	//设置文件上传存放地址
	form.uploadDir = "./public/images";
	//执行里面的回调函数的时候，表单已经全部接收完毕了。
	form.parse(req, function(err, fields, files) {
		var oldpath = files.picture.path;
		var extname = files.picture.name;

		//console.log(fields ,"+" ,files)
		//新的路径由三个部分组成：时间戳、随机数、拓展名
		var newpath = "./public/images/" + extname;
		
		//往原先的数据里面插入图片的数据
			var upda = function(){
					var selectors = [{"_id": ObjectId(fields._id)}, //这里需要这样写
						{
							"$set": {
								img_src: "http://localhost:3000/images/" + extname
							}
						}
					];
	
					handler(req, res, "courseList", "backIndex", selectors, function(result) {
						if(result) {
							console.log("lllll+" ,result)
							res.send({
								"success": true
							});
						} else {
							res.send({
								"error": true
							})
						}
					});
			};
		//改名
		fs.rename(oldpath, newpath, function(err) {
			
			if(err) {
				throw Error("改名失败");
			};

			//在往里面添加图片之前先把前面的图片删除掉

			handler(req, res, "find", "backIndex", {"_id": ObjectId(fields._id)}, function(result) {
				
				if(result) {
					var img = result[0].img_src;
					console.log("img:",img)
					if(img) {
						//把图片地址换过来，用fs的unlink模块删掉
						img = img.replace("http://localhost:3000", "./public");
						console.log("img:",img);
						fs.unlink(img, function(err) {
								upda();
						})

					}else{
							upda()
						}

				} else {
					res.send({
						"error": true
					})
				}
			});

		});

	});

})

//删除一条数据
router.post("/delete", function(req, res, next) {
	if(req.body._id) {
		var selectors = {
			"_id": ObjectId(req.body._id)
		};
		handler(req, res, "delete", "backIndex", selectors, function(result) {
			if(result) {
				res.send({
					"success": true
				});
			} else {
				res.send({
					"error": true
				})
			}
		});
	};
})

module.exports = router;