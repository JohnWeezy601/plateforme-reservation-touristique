const transporter = require("../config/email");


const envoyerEmailClient = async(
    email,
    sujet,
    message
)=>{

    console.log("📨 Envoi vers :", email);


    const info = await transporter.sendMail({

        from:{
            name:"Plateforme touristique",
            address:process.env.EMAIL_FROM
        },

        to:email,

        subject:sujet,

        text:message,

        html:`
            <div style="font-family:Arial">

                <h2>
                    Plateforme touristique
                </h2>

                <p>
                    ${message.replace(/\n/g,"<br>")}
                </p>

                <br>

                <b>
                    Merci pour votre confiance.
                </b>

            </div>
        `

    });


    console.log("✅ Email envoyé");
    console.log("Message ID :",info.messageId);


};


module.exports=envoyerEmailClient;