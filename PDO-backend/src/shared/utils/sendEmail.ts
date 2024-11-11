import nodemailer from "nodemailer";

export async function sendEmail(email:string, subject:string, text:string){
    console.log(process.env["HOST"],process.env["PASS"],Number(process.env["EMAIL_PORT"]));
	try {
		const transporter = nodemailer.createTransport({
			host: process.env["HOST"],
			//service: process.env.SERVICE,
			port: Number(process.env["EMAIL_PORT"]),
			secure: true,
			auth: {
				user: process.env["USER"],
				pass: process.env["PASS"],
			},
		});

		await transporter.sendMail({
			from: process.env["USER"],
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
        return {result: 'ok'};
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return {error: error};
	}
};