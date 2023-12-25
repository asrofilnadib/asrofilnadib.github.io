<?php
	if ($_SERVER["REQUEST_METHOD"] === "POST") {
		$name = $_POST["name"];
		$email = $_POST["email"];
		$message = $_POST["message"];
		
		$to = "asrofilnadibs28@gmail.com";
		
		$subject = "New Contact Form Submission";
		
		$body = "Name: $name\n";
		$body .= "Email: $email\n";
		$body .= "Message:\n$message";
		
		$headers = "From: $email";
		
		$success = mail($to, $subject, $body, $headers);
		
		if ($success) {
			echo "Your message has been sent successfully!";
		} else {
			echo "Failed to send the message. Please try again later.";
		}
	} else {
		// Jika bukan metode POST, kembalikan ke formulir
		header("Location: index.html");
	}

