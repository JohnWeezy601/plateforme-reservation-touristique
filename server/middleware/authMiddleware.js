const jwt = require("jsonwebtoken");


const authMiddleware = (req,res,next)=>{


    const authHeader = req.headers.authorization;


    if(!authHeader){

        return res.status(401).json({
            message:"Token manquant"
        });

    }



    const token = authHeader.split(" ")[1];


    if(!token){

        return res.status(401).json({
            message:"Token absent"
        });

    }



    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err,decoded)=>{


            if(err){

                console.log(err.message);


                return res.status(403).json({

                    message:"Token invalide",

                    erreur:err.message

                });

            }



            req.user = decoded;


            next();


        }
    );

};



module.exports = authMiddleware;