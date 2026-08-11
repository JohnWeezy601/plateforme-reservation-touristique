const express=require("express");

const router=express.Router();


const recuController=require("../controllers/recuController");



router.get(
"/:id",
recuController.getRecu
);



module.exports=router;