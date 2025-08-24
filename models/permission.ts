import Mongoose from 'mongoose';
 const PermissionSchema = new Mongoose.Schema({
   staff: {
     type: Mongoose.Schema.Types.ObjectId,
     ref: 'Staff',
     required: true
   },
   date: {
     type: Date,
     required: true
   },
  description: {
     type: String,
     required: true
   }
});
export default  Mongoose.models.Permission ||Mongoose.model('Permission', PermissionSchema);