const Product =require('../models/models.product');
const Rating =require('../models/models.ratings');
const mongoose=require('mongoose');
const { Validator } = require('node-input-validator');

exports.createRatings=async (req,res,next)=>{
 try {
    let productId=req.params.productId;
	if(!mongoose.Types.ObjectId.isValid(productId)){
		return res.status(400).send({
	  		message:'Invalid product id',
	  		data:{}
	  	});
	} 
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        return res.status(409).json({
          message: "Product not found",
        });
      }
      
            const new_rating = new Validator(req.body, {
                comment:'required',
                rating : 'required'
            });
            const matched = await new_rating.check();
            if (!matched) {
                return res.status(422).send(new_rating.errors);
            }
            let newPoduct_rating= new Rating ({
                comment:req.body.comment,
                rating:req.body.rating,
                productId: productId,
                userId:req.user.id
            });

            let ratingData = await newPoduct_rating.save();
           
            
     await Product.findByIdAndUpdate(
                {_id: productId},
                {
                   $push: {  product_rating : ratingData._id  } 
                },
                {
                    new: true,
                  }
            )

            return res.status(200).send({
                message:'Ratings successfully added',
                data:ratingData 
            });

               
      } catch (error) {
        next(error);
      }
    };
    