import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const subscriptionSchema = new mongoose.Schema ({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    channel:{
        type:mongoose.Schema.ObjectId,   
                        //    One the subscriber is subscribing
        ref:"user"
    }

},
{timestamps:true})

subscriptionSchema.plugin(mongooseAggregatePaginate)
const subscription = mongoose.model("subscription",subscriptionSchema)

 export {subscription}