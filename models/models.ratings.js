const mongoose=require('mongoose');
const ratingSchema = new mongoose.Schema({
	comment: {
        type: String,
        required: [true, "Please enter a valid description"],
    },
    rating: {
        type:  Number,
        enum: [1,2,3,4,5],
        default: 0
    },

	productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
},
{
    timestamps:true,
});


module.exports = mongoose.model('Rating', ratingSchema);
